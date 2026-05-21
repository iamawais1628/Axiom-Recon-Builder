import csv
from io import StringIO
from datetime import datetime

def parse_csv(file_content):
    """
    Parse CSV string into list of transactions
    
    Expected columns: amount, description, date
    Date format: YYYY-MM-DD
    """
    transactions = []
    
    try:
        reader = csv.DictReader(StringIO(file_content))
        
        for i, row in enumerate(reader, 1):
            try:
                # Get fields
                amount = float(row.get('amount', 0))
                description = row.get('description', '').strip()
                date_str = row.get('date', '').strip()
                
                # Validation
                if amount <= 0:
                    print(f"⚠ Row {i}: Amount must be positive, skipping")
                    continue
                
                if not description:
                    print(f"⚠ Row {i}: Description required, skipping")
                    continue
                
                # Validate date format
                try:
                    datetime.strptime(date_str, '%Y-%m-%d')
                except:
                    print(f"⚠ Row {i}: Invalid date format (use YYYY-MM-DD), skipping")
                    continue
                
                # Add to list
                transactions.append({
                    'amount': amount,
                    'description': description,
                    'date': date_str
                })
            
            except Exception as e:
                print(f"⚠ Row {i}: Error - {e}, skipping")
                continue
        
        return transactions
    
    except Exception as e:
        print(f"❌ Error parsing CSV: {e}")
        return []

# Test data
SAMPLE_BANK_CSV = """amount,description,date
1000.00,ABC Corp Payment,2024-01-15
500.50,Wire transfer XYZ,2024-01-16
2500.00,Check 4521,2024-01-17
3200.75,Invoice ABC,2024-01-18
1500.00,Vendor Payment,2024-01-19
"""

SAMPLE_ERP_CSV = """amount,description,date
1000.00,Invoice from ACME,2024-01-15
500.50,Payment to XYZ Co,2024-01-16
2500.00,Check payment 4521,2024-01-17
3200.75,ABC Corp invoice,2024-01-18
1500.00,Vendor ABC payment,2024-01-19
"""

if __name__ == '__main__':
    print("Testing CSV Parser...")
    print("\n--- Bank Transactions ---")
    bank = parse_csv(SAMPLE_BANK_CSV)
    for tx in bank:
        print(f"  ${tx['amount']:8.2f} | {tx['description']:25} | {tx['date']}")
    
    print(f"\n✓ Parsed {len(bank)} bank transactions")
    
    print("\n--- ERP Transactions ---")
    erp = parse_csv(SAMPLE_ERP_CSV)
    for tx in erp:
        print(f"  ${tx['amount']:8.2f} | {tx['description']:25} | {tx['date']}")
    
    print(f"\n✓ Parsed {len(erp)} ERP transactions")
