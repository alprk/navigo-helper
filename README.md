# Navigo Helper

This tool automates the download of your **Navigo monthly attestation** from the IDF Mobilités website.

> **Important:**
> This script currently supports:
>
> * Only accounts linked to a **Gmail address**
> * **Annual** Navigo contracts
>
> It has only been tested with Gmail accounts.

---

## ✉️ Gmail Setup Required

To allow the script to access the verification code sent by IDF Mobilités, you **must**:

1. Use a Gmail address linked to your IDF Mobilités account.
2. Enable **2-Step Verification** on your Gmail account.
3. Generate a [Gmail App Password](https://myaccount.google.com/apppasswords) and provide it in the `.env.local` file.

---

## 🧠 What This Helper Does

1. Launches a headless browser to log in to the IDF Mobilités website.
2. Triggers the sending of a verification code to your Gmail.
3. Uses an IMAP client to fetch the verification code from your inbox.
4. Enters the code to authenticate and continue the navigation.
5. Downloads the **monthly attestation**.
6. Saves the attestation PDF in your Desktop

---

## 🚀 Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-name/navigo-helper.git
   cd navigo-helper
   ```

2. Create a `.env.local` file with the following environment variables:

   ```env
    IDF_MOBILITE_USERNAME=your@gmail.com
    IDF_MOBILITE_PASSWORD=yourIdfMobilitePassword

    IMAP_USER=your@gmail.Com
    IMAP_PASS=your_application_password
   ```

3. Start the helper using:

   ```bash
   make start
   ```
