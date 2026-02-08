import requests
import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from dotenv import find_dotenv, load_dotenv
import os

from datetime import datetime, time

def check_website_up(url):
    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return False, response.status_code
        return True, None
    except requests.RequestException:
        return False, None
    
def send_alert(url, sender, receiver, password, error_code):
    message = MIMEMultipart("alternative")
    message["Subject"] = "Website Down Alert"
    message["From"] = sender
    message["To"] = receiver
    error_code_str = str(error_code) if error_code is not None else "Unknown Error"

    text = """\
        Hi,
        The website you are monitoring is down.
        Website Address: """ + url + """
        Error Code: """ + error_code_str + """
    """

    html = """\
    <html>
    <body>
        <p>Hi,<br>
        The website you are monitoring is down.<br>
        Website Address: """ + url + """<br>
        Error Code: """ + error_code_str + """
        </p>
    </body>
    </html>
    """

    # Turn these into plain/html MIMEText objects
    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")

    # Add HTML/plain-text parts to MIMEMultipart message
    # The email client will try to render the last part first
    message.attach(part1)
    message.attach(part2)

    # Create secure connection with server and send email
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(sender, password)
        server.sendmail(
            sender, receiver, message.as_string()
        )

def sanity_check(sender, receiver, password):
    message = MIMEMultipart("alternative")
    message["Subject"] = "CRON Job Sanity Check"
    message["From"] = sender
    message["To"] = receiver

    text = """\
        Good Morning,
        The CRON Job is working fine. *^_^*
    """

    html = """\
    <html>
    <body>
        <p>Good Morning,<br>
        The CRON Job is working fine. *^_^*
        </p>
    </body>
    </html>
    """

    # Turn these into plain/html MIMEText objects
    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")

    # Add HTML/plain-text parts to MIMEMultipart message
    # The email client will try to render the last part first
    message.attach(part1)
    message.attach(part2)

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
        server.login(sender, password)
        server.sendmail(
            sender, receiver, message.as_string()
        )

if __name__ == "__main__":
    load_dotenv(find_dotenv())
    url = os.getenv("url")
    sender_email = os.getenv("sender_email")
    receiver_emails = os.getenv("receiver_emails").split(",")
    password = os.getenv("sender_password")

    sent_time = time(hour=22, minute=30)  # Set the time for the sanity check (9:00 AM)
    current_time = datetime.now()
    if current_time.hour == sent_time.hour and current_time.minute == sent_time.minute:
        for receiver in receiver_emails:
            sanity_check(sender_email, receiver, password)
    
    if not check_website_up(url)[0]:
        error_code = check_website_up(url)[1]
        for receiver in receiver_emails:
            send_alert(url, sender_email, receiver, password, error_code)
    else:
        print("Website is up.")