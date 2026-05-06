from decimal import Decimal

BODY_PART_MULTIPLIERS: dict[str, Decimal] = {
    "BRAZO":      Decimal("1.00"),
    "ANTEBRAZO":  Decimal("1.00"),
    "PIERNA":     Decimal("1.10"),
    "HOMBRO":     Decimal("1.05"),
    "ESPALDA":    Decimal("1.30"),
    "PECHO":      Decimal("1.25"),
    "COSTILLAS":  Decimal("1.50"),
    "CUELLO":     Decimal("1.40"),
    "MANO":       Decimal("1.35"),
    "PIE":        Decimal("1.35"),
}

COLOR_MULTIPLIER = Decimal("1.20")
BW_MULTIPLIER = Decimal("1.00")


def calculate_estimated_price(
    size_cm: int,
    body_part: str,
    is_color: bool,
    base_hourly_rate: Decimal,
    minimum_setup_fee: Decimal,
) -> Decimal:
    zone_mult = BODY_PART_MULTIPLIERS.get(body_part, Decimal("1.00"))
    clr_mult = COLOR_MULTIPLIER if is_color else BW_MULTIPLIER
    raw = Decimal(size_cm) * base_hourly_rate * zone_mult * clr_mult
    return max(raw, minimum_setup_fee).quantize(Decimal("0.01"))
