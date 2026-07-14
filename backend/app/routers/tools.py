import random
import secrets
import string
from decimal import Decimal, InvalidOperation, localcontext
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/tools", tags=["tools"])


class RandomNumberIn(BaseModel):
    min: int
    max: int


class RandomPickIn(BaseModel):
    items: list[str] = Field(min_length=1)
    count: int = Field(default=1, ge=1)


class DiceIn(BaseModel):
    sides: int = Field(default=6, ge=2, le=1000)
    count: int = Field(default=1, ge=1, le=100)


class PasswordIn(BaseModel):
    length: int = Field(default=16)
    use_uppercase: bool = True
    use_lowercase: bool = True
    use_digits: bool = True
    use_symbols: bool = True


class ConvertIn(BaseModel):
    category: Literal["length", "temperature", "weight"]
    from_unit: str
    to_unit: str
    value: str


@router.post("/random/number")
def random_number(payload: RandomNumberIn):
    if payload.min > payload.max:
        raise HTTPException(status_code=400, detail="最小值不能大于最大值")
    return {"result": random.randint(payload.min, payload.max), "min": payload.min, "max": payload.max}


@router.post("/random/pick")
def random_pick(payload: RandomPickIn):
    if payload.count > len(payload.items):
        raise HTTPException(status_code=400, detail="不能选择的数量大于可选项数量")
    picked = random.sample(payload.items, payload.count)
    return {"items": picked, "count": payload.count}


@router.post("/random/dice")
def random_dice(payload: DiceIn):
    rolls = [random.randint(1, payload.sides) for _ in range(payload.count)]
    return {"rolls": rolls, "total": sum(rolls), "sides": payload.sides, "count": payload.count}


@router.post("/password")
def generate_password(payload: PasswordIn):
    if payload.length < 1:
        raise HTTPException(status_code=400, detail="长度过小")
    if payload.length > 100:
        raise HTTPException(status_code=400, detail="长度过大")
    pools = []
    required = []
    if payload.use_uppercase:
        pools.append(string.ascii_uppercase)
        required.append(secrets.choice(string.ascii_uppercase))
    if payload.use_lowercase:
        pools.append(string.ascii_lowercase)
        required.append(secrets.choice(string.ascii_lowercase))
    if payload.use_digits:
        pools.append(string.digits)
        required.append(secrets.choice(string.digits))
    if payload.use_symbols:
        symbols = "!@#$%^&*()-_=+[]{};:,.?/"
        pools.append(symbols)
        required.append(secrets.choice(symbols))
    if not pools:
        raise HTTPException(status_code=400, detail="至少选择一项字符类型")
    alphabet = "".join(pools)
    if len(required) > payload.length:
        chars = [secrets.choice(alphabet) for _ in range(payload.length)]
    else:
        remaining = [secrets.choice(alphabet) for _ in range(payload.length - len(required))]
        chars = required + remaining
    secrets.SystemRandom().shuffle(chars)
    password = "".join(chars)
    return {"password": password, "length": payload.length}


_LENGTH_TO_M = {
    "mm": Decimal("0.001"),
    "cm": Decimal("0.01"),
    "m": Decimal("1"),
    "km": Decimal("1000"),
    "in": Decimal("0.0254"),
    "ft": Decimal("0.3048"),
    "yd": Decimal("0.9144"),
    "mile": Decimal("1609.344"),
}

_WEIGHT_TO_G = {
    "mg": Decimal("0.001"),
    "g": Decimal("1"),
    "kg": Decimal("1000"),
    "ton": Decimal("1000000"),
    "oz": Decimal("28.349523125"),
    "lb": Decimal("453.59237"),
}


def _parse_decimal(value: str) -> Decimal:
    try:
        return Decimal(str(value).strip())
    except (InvalidOperation, ValueError):
        raise HTTPException(status_code=400, detail="请输入正确的数值")


def _decimal_precision(*values: Decimal) -> int:
    digits = 0
    for value in values:
        digits += len(value.as_tuple().digits)
    return max(64, digits + 20)


def _format_decimal(value: Decimal) -> str:
    text = format(value, "f")
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return text


def _convert_temperature(value: Decimal, from_unit: str, to_unit: str) -> Decimal:
    with localcontext() as ctx:
        ctx.prec = _decimal_precision(value, Decimal("273.15"), Decimal("9"))
        src = from_unit.lower()
        dst = to_unit.lower()
        if src == "c":
            celsius = value
        elif src == "f":
            celsius = (value - Decimal("32")) * Decimal("5") / Decimal("9")
        elif src == "k":
            celsius = value - Decimal("273.15")
        else:
            raise HTTPException(status_code=400, detail="unsupported temperature unit")

        if dst == "c":
            return celsius
        if dst == "f":
            return celsius * Decimal("9") / Decimal("5") + Decimal("32")
        if dst == "k":
            return celsius + Decimal("273.15")
        raise HTTPException(status_code=400, detail="unsupported temperature unit")


def _convert_factor(value: Decimal, from_unit: str, to_unit: str, table: dict[str, Decimal], label: str) -> Decimal:
    src = from_unit.lower()
    dst = to_unit.lower()
    if src not in table or dst not in table:
        raise HTTPException(status_code=400, detail=f"unsupported {label} unit")
    with localcontext() as ctx:
        ctx.prec = _decimal_precision(value, table[src], table[dst])
        base = value * table[src]
        return base / table[dst]


@router.post("/convert")
def convert_unit(payload: ConvertIn):
    value = _parse_decimal(payload.value)
    if payload.category == "length":
        result = _convert_factor(value, payload.from_unit, payload.to_unit, _LENGTH_TO_M, "length")
    elif payload.category == "weight":
        result = _convert_factor(value, payload.from_unit, payload.to_unit, _WEIGHT_TO_G, "weight")
    else:
        result = _convert_temperature(value, payload.from_unit, payload.to_unit)
    return {
        "category": payload.category,
        "from_unit": payload.from_unit,
        "to_unit": payload.to_unit,
        "value": _format_decimal(value),
        "result": _format_decimal(result),
    }
