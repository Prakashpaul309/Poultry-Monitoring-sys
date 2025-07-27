from supabase import create_client
import smtplib
from email.message import EmailMessage

# --- Configuration ---
SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3dHdqdmxscmtja2V0Y3ZuemVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY1NzU4NSwiZXhwIjoyMDY2MjMzNTg1fQ.bjShwn9bUuqlk5v6B29MhlebMJeo6izKxvLeIqzapH0'
EMAIL_USER = 'prakashpaul275@gmail.com'
EMAIL_PASS = 'Prakash@123'

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Thresholds ---
THRESHOLDS = {
    "temperature": 35,
    "humidity": 70,
    "ammonia": 14,
    "ph_low": 6,
    "ph_high": 8
}

# --- Send Email Function ---
def send_alert_email(to_email, farm_name, temperature, humidity, ammonia, ph):
    msg = EmailMessage()
    msg['Subject'] = f'⚠️ Alert from Your Farm: {farm_name}'
    msg['From'] = EMAIL_USER
    msg['To'] = to_email
    msg.set_content(f'''
Hi,

Your farm "{farm_name}" has crossed one or more safe thresholds:

🌡 Temperature: {temperature}°C
💧 Humidity: {humidity}%
🧪 Ammonia: {ammonia} ppm
🧫 pH: {ph}

Please take immediate action.

- Murgi Dhanda Monitoring System
''')

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)
            print(f"✅ Alert sent to {to_email}")
    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {e}")

# --- Main Alert Logic ---
def check_and_send_alerts():
    result = supabase.rpc('get_latest_sensor_alerts').execute()

    if not result.data:
        print("No farms with recent sensor data.")
        return

    for row in result.data:
        email = row['email']
        farm_name = row['farm_name']
        temp = row['temperature']
        humid = row['humidity']
        ammo = row['ammonia']
        ph = row['ph']

        # Fetch alert_active from farms table
        farm = supabase.table('farms').select('id', 'alert_active').eq('farm.name', farm_name).single().execute()
        if not farm.data:
            continue

        farm_id = farm.data['id']
        alert_active = farm.data['alert_active']

        # Check if current values are within safe range
        is_alert = (
            temp > THRESHOLDS['temperature'] or
            humid > THRESHOLDS['humidity'] or
            ammo > THRESHOLDS['ammonia'] or
            ph < THRESHOLDS['ph_low'] or
            ph > THRESHOLDS['ph_high']
        )

        if is_alert and not alert_active:
            # 1st time threshold breach → send alert + update alert_active = TRUE
            send_alert_email(email, farm_name, temp, humid, ammo, ph)
            supabase.table('farms').update({'alert_active': True}).eq('id', farm_id).execute()
        elif not is_alert and alert_active:
            # Values returned to normal → reset alert_active = FALSE
            supabase.table('farms').update({'alert_active': False}).eq('id', farm_id).execute()
            print(f"ℹ️ Reset alert_active for {farm_name} (back to safe)")

# --- Run it ---
if __name__ == "__main__":
    check_and_send_alerts()
