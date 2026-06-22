import numpy as np
import pandas as pd
from typing import Optional


def generate_pump_data(n: int = 100, seed: Optional[int] = None) -> pd.DataFrame:
    if seed is not None:
        np.random.seed(seed)
    else:
        np.random.seed(42)
    
    running_hours = np.random.uniform(100, 15000, n)
    voltage = np.random.normal(230, 10, n).clip(180, 260)
    temperature = np.random.normal(55, 15, n).clip(20, 95)
    power_consumption = np.random.uniform(0.5, 10, n)
    vibration = np.random.exponential(1.5, n).clip(0.1, 5)
    oil_level = np.random.uniform(10, 100, n)
    last_maintenance_days = np.random.uniform(1, 365, n)
    
    health_score = (
        100 
        - 0.003 * running_hours
        - 0.15 * (temperature - 40).clip(0)
        - 6 * (vibration - 1).clip(0)
        - 0.06 * last_maintenance_days
        + 0.1 * oil_level
        + np.random.normal(0, 5, n)
    )
    health_score = np.clip(health_score, 0, 100)
    
    failure_prob = (
        0.3 * (running_hours > 10000).astype(float) +
        0.25 * (temperature > 70).astype(float) +
        0.2 * (vibration > 3).astype(float) +
        0.15 * (last_maintenance_days > 180).astype(float) +
        0.1 * (oil_level < 30).astype(float) +
        np.random.uniform(0, 0.15, n)
    )
    failure = (failure_prob > 0.5).astype(int)
    
    df = pd.DataFrame({
        "running_hours": np.round(running_hours, 1),
        "voltage": np.round(voltage, 1),
        "temperature": np.round(temperature, 1),
        "power_consumption": np.round(power_consumption, 2),
        "vibration": np.round(vibration, 2),
        "oil_level": np.round(oil_level, 1),
        "last_maintenance_days": np.round(last_maintenance_days, 1),
        "health_score": np.round(health_score, 2),
        "failure": failure
    })
    
    return df


def generate_water_quality_data(n: int = 100, seed: Optional[int] = None) -> pd.DataFrame:
    if seed is not None:
        np.random.seed(seed)
    else:
        np.random.seed(42)
    
    n_safe = int(n * 0.8)
    n_unsafe = n - n_safe
    
    pH_safe = np.random.normal(7.2, 0.3, n_safe).clip(6.5, 8.5)
    pH_unsafe = np.concatenate([
        np.random.normal(5.8, 0.3, n_unsafe // 2),
        np.random.normal(9.0, 0.3, n_unsafe - n_unsafe // 2)
    ]).clip(4.5, 10)
    pH = np.concatenate([pH_safe, pH_unsafe])
    
    TDS_safe = np.random.normal(250, 50, n_safe).clip(50, 450)
    TDS_unsafe = np.random.normal(600, 100, n_unsafe).clip(400, 1200)
    TDS = np.concatenate([TDS_safe, TDS_unsafe])
    
    turbidity_safe = np.random.exponential(0.3, n_safe).clip(0, 0.9)
    turbidity_unsafe = np.random.exponential(2, n_unsafe).clip(0.5, 10)
    turbidity = np.concatenate([turbidity_safe, turbidity_unsafe])
    
    chlorine_safe = np.random.normal(0.5, 0.15, n_safe).clip(0.2, 0.9)
    chlorine_unsafe = np.random.uniform(0, 0.1, n_unsafe)
    chlorine = np.concatenate([chlorine_safe, chlorine_unsafe])
    
    fluoride_safe = np.random.normal(0.4, 0.15, n_safe).clip(0.1, 0.9)
    fluoride_unsafe = np.random.normal(1.5, 0.3, n_unsafe).clip(1.0, 3.0)
    fluoride = np.concatenate([fluoride_safe, fluoride_unsafe])
    
    iron_safe = np.random.exponential(0.1, n_safe).clip(0, 0.25)
    iron_unsafe = np.random.exponential(0.5, n_unsafe).clip(0.3, 2.0)
    iron = np.concatenate([iron_safe, iron_unsafe])
    
    nitrate_safe = np.random.normal(20, 8, n_safe).clip(5, 40)
    nitrate_unsafe = np.random.normal(60, 15, n_unsafe).clip(45, 100)
    nitrate = np.concatenate([nitrate_safe, nitrate_unsafe])
    
    coliform_safe = np.zeros(n_safe)
    coliform_unsafe = np.random.poisson(5, n_unsafe).clip(1, 20)
    coliform = np.concatenate([coliform_safe, coliform_unsafe])
    
    is_safe = np.concatenate([np.ones(n_safe), np.zeros(n_unsafe)]).astype(int)
    
    indices = np.random.permutation(n)
    
    df = pd.DataFrame({
        "pH": np.round(pH[indices], 2),
        "TDS": np.round(TDS[indices], 1),
        "turbidity": np.round(turbidity[indices], 3),
        "chlorine": np.round(chlorine[indices], 3),
        "fluoride": np.round(fluoride[indices], 3),
        "iron": np.round(iron[indices], 3),
        "nitrate": np.round(nitrate[indices], 2),
        "coliform": coliform[indices].astype(int),
        "is_safe": is_safe[indices]
    })
    
    return df


def generate_leak_data(n: int = 100, seed: Optional[int] = None) -> pd.DataFrame:
    if seed is not None:
        np.random.seed(seed)
    else:
        np.random.seed(42)
    
    flow_rate = np.random.uniform(0.5, 15.0, n)
    pressure = np.random.uniform(10, 80, n)
    water_consumption = np.random.uniform(5, 500, n)
    
    leak_probability = (
        0.3 * (flow_rate > 12).astype(float) +
        0.25 * (pressure < 25).astype(float) +
        0.2 * (water_consumption > 350).astype(float) +
        0.15 * ((flow_rate / (pressure + 1e-6)) > 0.5).astype(float) +
        0.1 * ((water_consumption / 24) > 25).astype(float) +
        np.random.uniform(0, 0.15, n)
    )
    
    leak_detected = (leak_probability > 0.45).astype(int)
    
    df = pd.DataFrame({
        "flow_rate": np.round(flow_rate, 2),
        "pressure": np.round(pressure, 1),
        "water_consumption": np.round(water_consumption, 1),
        "leak_detected": leak_detected
    })
    
    return df


def generate_consumption_data(n: int = 100, seed: Optional[int] = None) -> pd.DataFrame:
    if seed is not None:
        np.random.seed(seed)
    else:
        np.random.seed(42)
    
    dates = pd.date_range(start="2024-01-01", periods=n, freq="D")
    
    base_consumption = np.random.normal(200, 30, n)
    
    day_of_week = dates.dayofweek.values
    weekend_factor = np.where(day_of_week >= 5, 1.3, 1.0)
    
    seasonal_factor = 1 + 0.2 * np.sin(2 * np.pi * np.arange(n) / 365)
    
    daily_consumption = base_consumption * weekend_factor * seasonal_factor + np.random.normal(0, 20, n)
    daily_consumption = np.clip(daily_consumption, 50, 500)
    
    household_count = np.random.randint(50, 200, n)
    per_capita = daily_consumption / household_count
    
    df = pd.DataFrame({
        "date": dates.strftime("%Y-%m-%d"),
        "daily_consumption": np.round(daily_consumption, 1),
        "household_count": household_count,
        "per_capita_consumption": np.round(per_capita, 2),
        "day_of_week": day_of_week,
        "is_weekend": (day_of_week >= 5).astype(int),
        "month": dates.month.values
    })
    
    return df
