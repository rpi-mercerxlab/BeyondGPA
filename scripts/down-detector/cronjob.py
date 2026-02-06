import requests
import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from dotenv import load_dotenv
import os


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

if __name__ == "__main__":
    load_dotenv()
    url = "http://localhost:3001/" # Replace with your target URL
    sender_email = os.getenv("sender_email")
    receiver_emails = ["luq9@rpi.edu", "hemis1227@gmail.com"]
    password = os.getenv("sender_password")
    if not check_website_up(url)[0]:
        error_code = check_website_up(url)[1]
        for receiver in receiver_emails:
            send_alert(url, sender_email, receiver, password, error_code)
    else:
        print("Website is up.")