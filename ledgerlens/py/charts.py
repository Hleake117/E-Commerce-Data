import sqlite3
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd


DB = str(Path(__file__).resolve().parent.parent / "db" / "ledgerlens.db")
ASSETS = Path(__file__).resolve().parent.parent / "web" / "src" / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)
DATA = Path(__file__).resolve().parent.parent / "web" / "src" / "data"
DATA.mkdir(parents=True, exist_ok=True)


def q(sql: str) -> pd.DataFrame:
  with sqlite3.connect(DB) as con:
    return pd.read_sql_query(sql, con)


def export_monthly_kpis() -> pd.DataFrame:
  df = q("SELECT * FROM v_orders_month ORDER BY ym;")
  df.to_csv(DATA / "orders_month.csv", index=False)
  return df


def chart_revenue_vs_profit(df: pd.DataFrame) -> None:
  ax = df.plot(x="ym", y=["revenue", "gross_profit"], figsize=(8, 4))
  ax.set_title("Revenue vs Gross Profit (Monthly)")
  ax.set_xlabel("")
  plt.tight_layout()
  plt.savefig(ASSETS / "rev_gp.png", dpi=160)
  plt.close()


def chart_aov(df: pd.DataFrame) -> None:
  ax = df.plot(x="ym", y=["aov"], figsize=(8, 4))
  ax.set_title("Average Order Value (Monthly)")
  ax.set_xlabel("")
  plt.tight_layout()
  plt.savefig(ASSETS / "aov.png", dpi=160)
  plt.close()


def main() -> None:
  df = export_monthly_kpis()
  chart_revenue_vs_profit(df)
  chart_aov(df)
  print("Exported charts to web/src/assets and CSVs to web/src/data")


if __name__ == "__main__":
  main()

