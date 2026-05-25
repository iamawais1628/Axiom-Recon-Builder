import os
from groq import Groq

# Lazy initialize client - only create when needed
_client = None

def get_client():
    """Get or create Groq client (lazy initialization)"""
    global _client
    if _client is None:
        api_key = os.getenv('GROQ_API_KEY')
        if not api_key:
            raise ValueError("GROQ_API_KEY environment variable not set")
        _client = Groq(api_key=api_key)
    return _client

def analyze_unmatched_transactions(bank_transactions, erp_transactions, limit=5):
    """
    Use Groq to analyze unmatched transactions and suggest potential matches
    """
    try:
        client = get_client()
        
        # Prepare data for analysis
        bank_summary = f"Bank transactions ({len(bank_transactions)} total):\n"
        for i, tx in enumerate(bank_transactions[:limit]):
            bank_summary += f"  {i+1}. Amount: ${tx.get('amount', 0)}, Description: {tx.get('description', 'N/A')}, Date: {tx.get('date', 'N/A')}\n"
        
        erp_summary = f"\nERP transactions ({len(erp_transactions)} total):\n"
        for i, tx in enumerate(erp_transactions[:limit]):
            erp_summary += f"  {i+1}. Amount: ${tx.get('amount', 0)}, Description: {tx.get('description', 'N/A')}, Date: {tx.get('date', 'N/A')}\n"
        
        prompt = f"""You are a financial reconciliation expert. Analyze these unmatched transactions and suggest potential matches.

{bank_summary}
{erp_summary}

For each potential match, explain:
1. The two transactions that match
2. Why they likely match (amount, date, description similarity)
3. Confidence level (High/Medium/Low)
4. Any discrepancies to note

Be concise and practical."""

        message = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return {
            'status': 'success',
            'analysis': message.choices[0].message.content,
            'model': 'mixtral-8x7b-32768'
        }
    
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }

def suggest_matching_rules(transactions_data, match_history=None):
    """
    Use Groq to suggest matching rules based on transaction patterns
    """
    try:
        client = get_client()
        
        # Prepare data summary
        summary = f"""Analyze {len(transactions_data)} transactions and suggest matching rules.
        
Transaction examples:
"""
        for i, tx in enumerate(transactions_data[:10]):
            summary += f"  {i+1}. Amount: ${tx.get('amount', 0)}, Desc: {tx.get('description', 'N/A')}, Date: {tx.get('date', 'N/A')}\n"
        
        prompt = f"""{summary}

Based on these transactions, suggest 3-5 practical matching rules that would improve reconciliation accuracy.

For each rule, provide:
1. Rule name (e.g., "Amount Match Within $10")
2. Matching logic (e.g., "Match if amount differs by less than $10 and date is within 3 days")
3. Expected success rate (estimated percentage of matches this rule would catch)
4. Priority (High/Medium/Low)

Be specific and actionable."""

        message = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return {
            'status': 'success',
            'suggestions': message.choices[0].message.content,
            'model': 'mixtral-8x7b-32768'
        }
    
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }

def explain_mismatch(bank_tx, erp_tx):
    """
    Use Groq to explain why two similar transactions don't match
    """
    try:
        client = get_client()
        
        prompt = f"""You are a financial reconciliation expert. Explain why these two transactions likely don't match despite being similar:

Bank Transaction:
- Amount: ${bank_tx.get('amount', 0)}
- Description: {bank_tx.get('description', 'N/A')}
- Date: {bank_tx.get('date', 'N/A')}

ERP Transaction:
- Amount: ${erp_tx.get('amount', 0)}
- Description: {erp_tx.get('description', 'N/A')}
- Date: {erp_tx.get('date', 'N/A')}

Analyze the differences and explain:
1. Key discrepancies
2. Possible reasons for the mismatch
3. Whether they might still be related
4. Recommended next steps

Be concise and practical."""

        message = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            max_tokens=512,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return {
            'status': 'success',
            'explanation': message.choices[0].message.content,
            'model': 'mixtral-8x7b-32768'
        }
    
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }

def summarize_reconciliation(session_data):
    """
    Use Groq to generate a summary of reconciliation results
    """
    try:
        client = get_client()
        
        prompt = f"""Generate a professional reconciliation summary based on these results:

Session: {session_data.get('session_name', 'Unnamed')}
Total Matched: {session_data.get('total_matched', 0)}
Total Unmatched: {session_data.get('total_unmatched', 0)}
Match Rate: {session_data.get('match_rate', 0):.1f}%
Average Confidence: {session_data.get('avg_confidence', 0):.1f}%

Provide:
1. Executive summary (1-2 sentences)
2. Key findings
3. Areas of concern
4. Recommended actions

Keep it concise and actionable."""

        message = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            max_tokens=512,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        return {
            'status': 'success',
            'summary': message.choices[0].message.content,
            'model': 'mixtral-8x7b-32768'
        }
    
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }
