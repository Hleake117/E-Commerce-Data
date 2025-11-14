import sqlite3
import sys
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd

DB = str(Path(__file__).resolve().parent.parent / "db" / "ledgerlens.db")
ASSETS = Path(__file__).resolve().parent.parent / "web" / "src" / "assets"
ASSETS.mkdir(parents=True, exist_ok=True)
DATA = Path(__file__).resolve().parent.parent / "web" / "src" / "data"
DATA.mkdir(parents=True, exist_ok=True)

# Required views for the script to work
REQUIRED_VIEWS = [
    "v_orders_month",
    "v_country_summary",
    "v_top_customers",
    "v_sku_abc",
]


def validate_database() -> None:
    """Check if database exists and required views are present."""
    if not Path(DB).exists():
        raise FileNotFoundError(f"Database not found: {DB}. Please run SQL setup scripts first.")
    
    with sqlite3.connect(DB) as con:
        cursor = con.cursor()
        # Check if views exist
        for view_name in REQUIRED_VIEWS:
            cursor.execute(
                "SELECT name FROM sqlite_master WHERE type='view' AND name=?",
                (view_name,)
            )
            if not cursor.fetchone():
                raise ValueError(f"Required view '{view_name}' not found. Please run sql/20_views.sql first.")


def q(sql: str) -> pd.DataFrame:
    """Execute SQL query and return DataFrame. Raises exception on error."""
    try:
        with sqlite3.connect(DB) as con:
            return pd.read_sql_query(sql, con)
    except sqlite3.Error as e:
        raise RuntimeError(f"Database query failed: {e}") from e


def validate_monthly_data(df: pd.DataFrame) -> None:
    """Validate monthly KPI data for quality issues."""
    if df.empty:
        raise ValueError("Monthly data is empty")
    
    # Check required columns
    required_cols = ["ym", "revenue", "gross_profit"]
    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")
    
    # Check for null values in critical columns
    critical_cols = ["ym", "revenue", "gross_profit"]
    for col in critical_cols:
        null_count = df[col].isna().sum()
        if null_count > 0:
            print(f"  ⚠️  Warning: {null_count} null values found in {col}")
    
    # Validate revenue and profit are non-negative
    negative_revenue = (df["revenue"] < 0).sum()
    negative_profit = (df["gross_profit"] < 0).sum()
    if negative_revenue > 0:
        raise ValueError(f"Found {negative_revenue} rows with negative revenue")
    if negative_profit > 0:
        print(f"  ⚠️  Warning: {negative_profit} rows with negative gross profit")
    
    # Check for outliers (revenue > 3 standard deviations from mean)
    if len(df) > 1:
        mean_rev = df["revenue"].mean()
        std_rev = df["revenue"].std()
        if std_rev > 0:
            outliers = df[abs(df["revenue"] - mean_rev) > 3 * std_rev]
            if len(outliers) > 0:
                print(f"  ⚠️  Warning: {len(outliers)} potential revenue outliers detected")
    
    # Validate date range (should be reasonable)
    if "ym" in df.columns:
        try:
            dates = pd.to_datetime(df["ym"] + "-01", format="%Y-%m-%d", errors="coerce")
            if dates.isna().any():
                print(f"  ⚠️  Warning: Some dates could not be parsed")
            else:
                date_range = (dates.max() - dates.min()).days
                if date_range > 365 * 5:  # More than 5 years seems suspicious
                    print(f"  ⚠️  Warning: Date range spans {date_range} days ({date_range/365:.1f} years)")
        except Exception:
            pass  # Date validation is optional


def validate_country_data(df: pd.DataFrame) -> None:
    """Validate country summary data."""
    if df.empty:
        raise ValueError("Country data is empty")
    
    if "country" not in df.columns or "revenue" not in df.columns:
        raise ValueError("Missing required columns: country, revenue")
    
    # Check for null countries
    null_countries = df["country"].isna().sum()
    if null_countries > 0:
        print(f"  ⚠️  Warning: {null_countries} rows with null country")
    
    # Validate revenue
    negative_revenue = (df["revenue"] < 0).sum()
    if negative_revenue > 0:
        raise ValueError(f"Found {negative_revenue} countries with negative revenue")


def validate_customer_data(df: pd.DataFrame) -> None:
    """Validate customer data."""
    if df.empty:
        raise ValueError("Customer data is empty")
    
    if "revenue" not in df.columns:
        raise ValueError("Missing required column: revenue")
    
    # Validate revenue
    negative_revenue = (df["revenue"] < 0).sum()
    if negative_revenue > 0:
        raise ValueError(f"Found {negative_revenue} customers with negative revenue")


def validate_sku_data(df: pd.DataFrame) -> None:
    """Validate SKU ABC data."""
    if df.empty:
        raise ValueError("SKU data is empty")
    
    if "sku" not in df.columns or "revenue" not in df.columns:
        raise ValueError("Missing required columns: sku, revenue")
    
    # Validate revenue
    negative_revenue = (df["revenue"] < 0).sum()
    if negative_revenue > 0:
        raise ValueError(f"Found {negative_revenue} SKUs with negative revenue")
    
    # Check ABC classification if present
    if "abc_class" in df.columns:
        valid_classes = {"A", "B", "C"}
        invalid = df[(~df["abc_class"].isin(valid_classes)) & (df["abc_class"].notna())]
        if len(invalid) > 0:
            print(f"  ⚠️  Warning: {len(invalid)} SKUs with invalid ABC class")


# CSV Exports
def export_monthly_kpis() -> pd.DataFrame:
    """Export monthly KPIs to CSV. Returns DataFrame."""
    try:
        df = q("SELECT * FROM v_orders_month ORDER BY ym;")
        if df.empty:
            raise ValueError("v_orders_month view returned no data")
        validate_monthly_data(df)
        df.to_csv(DATA / "orders_month.csv", index=False)
        return df
    except Exception as e:
        raise RuntimeError(f"Failed to export monthly KPIs: {e}") from e


def export_country_summary() -> pd.DataFrame:
    """Export country summary to CSV. Returns DataFrame."""
    try:
        df = q("SELECT * FROM v_country_summary;")
        if df.empty:
            raise ValueError("v_country_summary view returned no data")
        validate_country_data(df)
        df.to_csv(DATA / "country_summary.csv", index=False)
        return df
    except Exception as e:
        raise RuntimeError(f"Failed to export country summary: {e}") from e


def export_top_customers() -> pd.DataFrame:
    """Export top customers to CSV. Returns DataFrame."""
    try:
        df = q("SELECT * FROM v_top_customers;")
        if df.empty:
            raise ValueError("v_top_customers view returned no data")
        validate_customer_data(df)
        df.to_csv(DATA / "top_customers.csv", index=False)
        return df
    except Exception as e:
        raise RuntimeError(f"Failed to export top customers: {e}") from e


def export_sku_abc() -> pd.DataFrame:
    """Export SKU ABC analysis to CSV. Returns DataFrame."""
    try:
        df = q("SELECT * FROM v_sku_abc ORDER BY revenue DESC;")
        if df.empty:
            raise ValueError("v_sku_abc view returned no data")
        validate_sku_data(df)
        df.to_csv(DATA / "sku_abc.csv", index=False)
        return df
    except Exception as e:
        raise RuntimeError(f"Failed to export SKU ABC: {e}") from e


# Chart Functions
def chart_revenue_vs_profit(df: pd.DataFrame) -> None:
    """Generate revenue vs profit chart. Raises exception on error."""
    try:
        if df.empty or "ym" not in df.columns or "revenue" not in df.columns or "gross_profit" not in df.columns:
            raise ValueError("DataFrame missing required columns: ym, revenue, gross_profit")
        
        fig, ax = plt.subplots(figsize=(10, 5))
        ax.plot(df["ym"], df["revenue"] / 1000, marker="o", label="Revenue", linewidth=2)
        ax.plot(df["ym"], df["gross_profit"] / 1000, marker="s", label="Gross Profit", linewidth=2)
        ax.set_title("Monthly Revenue vs Gross Profit", fontsize=14, fontweight="bold")
        ax.set_xlabel("Month", fontsize=11)
        ax.set_ylabel("Amount (thousands)", fontsize=11)
        ax.legend(loc="best")
        ax.grid(True, alpha=0.3)
        plt.xticks(rotation=45, ha="right")
        plt.tight_layout()
        plt.savefig(ASSETS / "rev_gp.png", dpi=160, bbox_inches="tight")
        plt.close()
    except Exception as e:
        raise RuntimeError(f"Failed to generate revenue vs profit chart: {e}") from e


def chart_revenue_mom_growth(df: pd.DataFrame) -> None:
    """Generate revenue MoM growth chart. Raises exception on error."""
    try:
        if df.empty or "ym" not in df.columns or "revenue" not in df.columns:
            raise ValueError("DataFrame missing required columns: ym, revenue")
        
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 8), sharex=True)
        
        # Revenue line with MoM annotations
        ax1.plot(df["ym"], df["revenue"] / 1000, marker="o", linewidth=2, color="#2563eb")
        ax1.set_title("Monthly Revenue with MoM Growth", fontsize=14, fontweight="bold")
        ax1.set_ylabel("Revenue (thousands)", fontsize=11)
        ax1.grid(True, alpha=0.3)
        
        # Annotate MoM growth on points
        for i, row in df.iterrows():
            if pd.notna(row.get("revenue_mom_pct")):
                growth = row["revenue_mom_pct"] * 100
                color = "green" if growth > 0 else "red"
                ax1.annotate(
                    f"{growth:+.1f}%",
                    (i, row["revenue"] / 1000),
                    textcoords="offset points",
                    xytext=(0, 10),
                    ha="center",
                    fontsize=8,
                    color=color,
                    fontweight="bold"
                )
        
        # MoM growth bar chart
        mom_data = df[df["revenue_mom_pct"].notna()].copy()
        if not mom_data.empty:
            colors = ["green" if x > 0 else "red" for x in mom_data["revenue_mom_pct"] * 100]
            ax2.bar(range(len(mom_data)), mom_data["revenue_mom_pct"] * 100, color=colors, alpha=0.6)
            ax2.set_xticks(range(len(mom_data)))
            ax2.set_xticklabels(mom_data["ym"], rotation=45, ha="right")
        ax2.set_ylabel("MoM Growth (%)", fontsize=11)
        ax2.axhline(y=0, color="black", linestyle="-", linewidth=0.8)
        ax2.grid(True, alpha=0.3, axis="y")
        
        plt.tight_layout()
        plt.savefig(ASSETS / "revenue_mom.png", dpi=160, bbox_inches="tight")
        plt.close()
    except Exception as e:
        raise RuntimeError(f"Failed to generate revenue MoM growth chart: {e}") from e


def chart_domestic_vs_export(df: pd.DataFrame) -> None:
    """Generate domestic vs export chart. Raises exception on error."""
    try:
        if df.empty or "ym" not in df.columns:
            raise ValueError("DataFrame missing required columns: ym")
        
        fig, ax = plt.subplots(figsize=(10, 5))
        x = range(len(df))
        width = 0.35
        
        domestic = (df["revenue_domestic"] / 1000).fillna(0) if "revenue_domestic" in df.columns else pd.Series([0] * len(df))
        export = (df["revenue_export"] / 1000).fillna(0) if "revenue_export" in df.columns else pd.Series([0] * len(df))
        
        ax.bar([i - width/2 for i in x], domestic, width, label="Domestic (UK)", color="#3b82f6", alpha=0.8)
        ax.bar([i + width/2 for i in x], export, width, label="Export", color="#10b981", alpha=0.8)
        
        ax.set_title("Monthly Revenue: Domestic vs Export", fontsize=14, fontweight="bold")
        ax.set_xlabel("Month", fontsize=11)
        ax.set_ylabel("Revenue (thousands)", fontsize=11)
        ax.set_xticks(x)
        ax.set_xticklabels(df["ym"], rotation=45, ha="right")
        ax.legend(loc="best")
        ax.grid(True, alpha=0.3, axis="y")
        plt.tight_layout()
        plt.savefig(ASSETS / "domestic_export.png", dpi=160, bbox_inches="tight")
        plt.close()
    except Exception as e:
        raise RuntimeError(f"Failed to generate domestic vs export chart: {e}") from e


def chart_aov(df: pd.DataFrame) -> None:
    """Generate AOV chart. Raises exception on error."""
    try:
        if df.empty or "ym" not in df.columns or "aov" not in df.columns:
            raise ValueError("DataFrame missing required columns: ym, aov")
        
        fig, ax = plt.subplots(figsize=(10, 5))
        ax.plot(df["ym"], df["aov"], marker="o", linewidth=2, color="#8b5cf6")
        ax.set_title("Average Order Value (Monthly)", fontsize=14, fontweight="bold")
        ax.set_xlabel("Month", fontsize=11)
        ax.set_ylabel("AOV ($)", fontsize=11)
        ax.grid(True, alpha=0.3)
        plt.xticks(rotation=45, ha="right")
        plt.tight_layout()
        plt.savefig(ASSETS / "aov.png", dpi=160, bbox_inches="tight")
        plt.close()
    except Exception as e:
        raise RuntimeError(f"Failed to generate AOV chart: {e}") from e


def chart_top_countries(df: pd.DataFrame) -> None:
    """Generate top countries chart. Raises exception on error."""
    try:
        if df.empty or "country" not in df.columns or "revenue" not in df.columns:
            raise ValueError("DataFrame missing required columns: country, revenue")
        
        top_10 = df.head(10)
        if top_10.empty:
            raise ValueError("No country data available for chart")
        
        fig, ax = plt.subplots(figsize=(10, 6))
        
        bars = ax.barh(range(len(top_10)), top_10["revenue"] / 1000, color="#6366f1", alpha=0.8)
        ax.set_yticks(range(len(top_10)))
        ax.set_yticklabels(top_10["country"], fontsize=10)
        ax.set_xlabel("Revenue (thousands)", fontsize=11)
        ax.set_title("Top 10 Countries by Revenue", fontsize=14, fontweight="bold")
        ax.grid(True, alpha=0.3, axis="x")
        
        # Add value labels
        for i, (idx, row) in enumerate(top_10.iterrows()):
            ax.text(row["revenue"] / 1000 + 5, i, f"${row['revenue']/1000:.0f}K", 
                    va="center", fontsize=9)
        
        plt.tight_layout()
        plt.savefig(ASSETS / "top_countries.png", dpi=160, bbox_inches="tight")
        plt.close()
    except Exception as e:
        raise RuntimeError(f"Failed to generate top countries chart: {e}") from e


def chart_top_skus(df: pd.DataFrame) -> None:
    """Generate top SKUs chart with ABC classification. Raises exception on error."""
    try:
        if df.empty or "sku" not in df.columns or "revenue" not in df.columns:
            raise ValueError("DataFrame missing required columns: sku, revenue")
        
        top_20 = df.head(20)
        if top_20.empty:
            raise ValueError("No SKU data available for chart")
        
        fig, ax = plt.subplots(figsize=(10, 8))
        
        # Handle missing abc_class column gracefully
        if "abc_class" in top_20.columns:
            color_map = {"A": "#10b981", "B": "#f59e0b", "C": "#ef4444"}
            colors = top_20["abc_class"].map(color_map).fillna("#6366f1")
        else:
            colors = "#6366f1"
        
        bars = ax.barh(range(len(top_20)), top_20["revenue"] / 1000, 
                       color=colors, alpha=0.8)
        ax.set_yticks(range(len(top_20)))
        ax.set_yticklabels(top_20["sku"], fontsize=9)
        ax.set_xlabel("Revenue (thousands)", fontsize=11)
        ax.set_title("Top 20 SKUs by Revenue (ABC Classification)", fontsize=14, fontweight="bold")
        ax.grid(True, alpha=0.3, axis="x")
        
        # Add legend for ABC classes if available
        if "abc_class" in top_20.columns:
            from matplotlib.patches import Patch
            legend_elements = [
                Patch(facecolor="#10b981", alpha=0.8, label="Class A (Top 80%)"),
                Patch(facecolor="#f59e0b", alpha=0.8, label="Class B (80-95%)"),
                Patch(facecolor="#ef4444", alpha=0.8, label="Class C (Bottom 5%)")
            ]
            ax.legend(handles=legend_elements, loc="lower right")
        
        plt.tight_layout()
        plt.savefig(ASSETS / "top_skus.png", dpi=160, bbox_inches="tight")
        plt.close()
    except Exception as e:
        raise RuntimeError(f"Failed to generate top SKUs chart: {e}") from e


def chart_top_customers(df: pd.DataFrame) -> None:
    """Generate top customers chart. Raises exception on error."""
    try:
        if df.empty or "revenue" not in df.columns:
            raise ValueError("DataFrame missing required columns: revenue")
        
        top_15 = df.head(15)
        if top_15.empty:
            raise ValueError("No customer data available for chart")
        
        fig, ax = plt.subplots(figsize=(10, 7))
        
        bars = ax.barh(range(len(top_15)), top_15["revenue"] / 1000, color="#8b5cf6", alpha=0.8)
        ax.set_yticks(range(len(top_15)))
        labels = top_15["customer_id"].fillna("Anonymous").astype(str) if "customer_id" in top_15.columns else [f"Customer {i+1}" for i in range(len(top_15))]
        ax.set_yticklabels(labels, fontsize=9)
        ax.set_xlabel("Revenue (thousands)", fontsize=11)
        ax.set_title("Top 15 Customers by Lifetime Revenue", fontsize=14, fontweight="bold")
        ax.grid(True, alpha=0.3, axis="x")
        
        # Add value labels
        for i, (idx, row) in enumerate(top_15.iterrows()):
            ax.text(row["revenue"] / 1000 + 2, i, f"${row['revenue']/1000:.0f}K", 
                    va="center", fontsize=8)
        
        plt.tight_layout()
        plt.savefig(ASSETS / "top_customers.png", dpi=160, bbox_inches="tight")
        plt.close()
    except Exception as e:
        raise RuntimeError(f"Failed to generate top customers chart: {e}") from e


def main() -> None:
    """Main function to export CSVs and generate charts. Handles errors gracefully."""
    try:
        print("Validating database...")
        validate_database()
        print("✅ Database validation passed")
        
        print("\nExporting CSVs...")
        monthly_df = export_monthly_kpis()
        print("  ✓ Monthly KPIs exported and validated")
        country_df = export_country_summary()
        print("  ✓ Country summary exported and validated")
        customers_df = export_top_customers()
        print("  ✓ Top customers exported and validated")
        sku_df = export_sku_abc()
        print("  ✓ SKU ABC exported and validated")
        
        print("\nGenerating charts...")
        chart_revenue_vs_profit(monthly_df)
        print("  ✓ Revenue vs Profit chart")
        chart_revenue_mom_growth(monthly_df)
        print("  ✓ Revenue MoM Growth chart")
        chart_domestic_vs_export(monthly_df)
        print("  ✓ Domestic vs Export chart")
        chart_aov(monthly_df)
        print("  ✓ AOV chart")
        chart_top_countries(country_df)
        print("  ✓ Top Countries chart")
        chart_top_skus(sku_df)
        print("  ✓ Top SKUs chart")
        chart_top_customers(customers_df)
        print("  ✓ Top Customers chart")
        
        print("\n✅ Successfully exported all charts to web/src/assets and CSVs to web/src/data")
    except FileNotFoundError as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        print(f"\n❌ Data validation error: {e}", file=sys.stderr)
        print("   Please ensure the database is properly set up and views are created.", file=sys.stderr)
        sys.exit(1)
    except RuntimeError as e:
        print(f"\n❌ Runtime error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
