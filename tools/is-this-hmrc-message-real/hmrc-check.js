/* "Is this HMRC message real?" verdict engine for Plain Sums.
 *
 * Every rule below comes from GOV.UK and is cited next to the rule. Checked 20 October 2026.
 * The engine never says a message is definitely real or definitely fake. Green only means the
 * answers match what HMRC says genuine contact can look like.
 *
 * Sources:
 *  IDENTIFY  Identify tax scams by phone, text, email or social media
 *            https://www.gov.uk/guidance/identify-hmrc-related-scam-phone-calls-emails-and-text-messages
 *  REPORT    Report suspicious HMRC emails, texts, social media accounts and phone calls
 *            https://www.gov.uk/find-hmrc-contacts/report-suspicious-hmrc-emails-texts-social-media-accounts-and-phone-calls
 *  EXAMPLES  Examples of HMRC related phishing emails, suspicious phone calls and texts
 *            https://www.gov.uk/government/publications/phishing-and-bogus-emails-hm-revenue-and-customs-examples/phishing-emails-and-bogus-contact-hm-revenue-and-customs-examples
 *  LIST      Check a list of genuine HMRC contacts (collection)
 *            https://www.gov.uk/government/collections/check-a-list-of-genuine-hmrc-contacts
 *  MULTI     Check genuine HMRC contact that uses more than one communication method (updated 19 October 2026)
 *            https://www.gov.uk/guidance/check-genuine-hmrc-contact-that-uses-more-than-one-communication-method
 *  TEXTS     Check if a text message you've received from HMRC is genuine (updated 5 October 2026)
 *            https://www.gov.uk/guidance/check-if-a-text-message-youve-received-from-hmrc-is-genuine
 *  EMAILS    Check if an email you've received from HMRC is genuine (updated 15 October 2026)
 *            https://www.gov.uk/guidance/check-if-an-email-youve-received-from-hmrc-is-genuine
 *  CALLS     Check if a phone call you've received from HMRC is genuine (updated 30 June 2026)
 *            https://www.gov.uk/guidance/check-if-a-phone-call-youve-received-from-hmrc-is-genuine
 *  LETTERS   Check if a letter you've received from HMRC is genuine (updated 15 September 2026)
 *            https://www.gov.uk/guidance/check-if-a-letter-youve-received-from-hmrc-is-genuine
 *  QR        Check if a QR code on a letter you've received from HMRC is genuine (updated 16 February 2026)
 *            https://www.gov.uk/guidance/check-if-a-qr-code-on-a-letter-youve-received-from-hmrc-is-genuine
 *  CONTACT   Contact HMRC (the numbers to use, rather than any number in a message)
 *            https://www.gov.uk/contact-hmrc
 *  SIGNIN    Sign in to your HMRC online account
 *            https://www.gov.uk/log-in-register-hmrc-online-services
 */
(function (root) {
  "use strict";
  var SRC = {
    IDENTIFY: "https://www.gov.uk/guidance/identify-hmrc-related-scam-phone-calls-emails-and-text-messages",
    REPORT: "https://www.gov.uk/find-hmrc-contacts/report-suspicious-hmrc-emails-texts-social-media-accounts-and-phone-calls",
    EXAMPLES: "https://www.gov.uk/government/publications/phishing-and-bogus-emails-hm-revenue-and-customs-examples/phishing-emails-and-bogus-contact-hm-revenue-and-customs-examples",
    LIST: "https://www.gov.uk/government/collections/check-a-list-of-genuine-hmrc-contacts",
    MULTI: "https://www.gov.uk/guidance/check-genuine-hmrc-contact-that-uses-more-than-one-communication-method",
    TEXTS: "https://www.gov.uk/guidance/check-if-a-text-message-youve-received-from-hmrc-is-genuine",
    EMAILS: "https://www.gov.uk/guidance/check-if-an-email-youve-received-from-hmrc-is-genuine",
    CALLS: "https://www.gov.uk/guidance/check-if-a-phone-call-youve-received-from-hmrc-is-genuine",
    LETTERS: "https://www.gov.uk/guidance/check-if-a-letter-youve-received-from-hmrc-is-genuine",
    QR: "https://www.gov.uk/guidance/check-if-a-qr-code-on-a-letter-youve-received-from-hmrc-is-genuine",
    CONTACT: "https://www.gov.uk/contact-hmrc",
    SIGNIN: "https://www.gov.uk/log-in-register-hmrc-online-services"
  };
  var CHANNELS = ["text", "email", "phone", "letter", "social"];
  var FLAGS = ["refundLink", "bankDetails", "threat", "qr", "giftCrypto", "callback", "childBenefit", "taxCode", "mtdVat"];
  var RANK = { green: 0, amber: 1, red: 2 };

  // MULTI, "High Income Child Benefit Charge — check if you need to pay":
  // "From 6 July 2026 up to and including 31 December 2026, you may receive a letter or text message".
  var HICBC_FROM = "2026-07-06", HICBC_TO = "2026-12-31";

  var VERDICT = {
    green: "This matches what HMRC says genuine contact can look like, but check by signing in to your HMRC online account or calling HMRC on the number listed on GOV.UK, not a number in the message.",
    amber: "Be careful. Some of this can be genuine, but some of it is also what scams do. Do not click links, scan codes or call numbers in the message. Check by signing in to your HMRC online account or calling HMRC on the number listed on GOV.UK, not a number in the message.",
    red: "This has signs that GOV.UK says HMRC does not use. Treat it as a likely scam. Do not reply, click, pay or share details. Report it, then check your tax by signing in to your HMRC online account or calling HMRC on the number listed on GOV.UK, not a number in the message."
  };

  // Where to report, by channel. REPORT and TEXTS/IDENTIFY confirm 60599, phishing@hmrc.gov.uk and branddefence@hmrc.gov.uk.
  var REPORT_HOW = {
    text: "Forward the text to 60599 (network charges apply), then delete it.",            // REPORT, TEXTS
    email: "Forward the email to phishing@hmrc.gov.uk, then delete it.",                     // REPORT
    phone: "Use HMRC's online service to report a suspicious phone call.",                   // REPORT
    social: "Email the account name and platform to branddefence@hmrc.gov.uk and do not reply.", // REPORT, IDENTIFY
    letter: "GOV.UK has no forwarding address for letters. Do not use any number or code on it until you have checked it against GOV.UK." // LETTERS lists letters only
  };

  function add(list, level, text, src) { list.push({ level: level, text: text, src: src }); }

  function inWindow(date, from, to) { return !date || (date >= from && date <= to); }

  function check(input) {
    input = input || {};
    var ch = input.channel;
    if (CHANNELS.indexOf(ch) < 0) return { ok: false, error: "Choose how you were contacted." };
    var f = {};
    FLAGS.forEach(function (k) { f[k] = !!(input.flags && input.flags[k]); });
    var date = input.date || null; // "YYYY-MM-DD", the day the contact arrived
    var r = [];

    // Social media or WhatsApp. IDENTIFY: "If you cannot verify an account claiming to be HMRC, do not reply or share any information."
    // GOV.UK does not list any genuine HMRC contact by social media or WhatsApp; I treat WhatsApp as a social media message.
    if (ch === "social") add(r, "amber", "GOV.UK does not list any genuine HMRC messages sent by social media or WhatsApp. If you cannot check the account is really HMRC, GOV.UK says do not reply or share anything.", SRC.IDENTIFY);

    // Threats. IDENTIFY: "HMRC will never: leave a voicemail threatening legal action; threaten arrest"; checklist: "rushes you", "is threatening".
    // EXAMPLES: automated call saying HMRC is filing a lawsuit and to press 1 to pay "is a scam".
    if (f.threat) add(r, "red", "GOV.UK says HMRC will never threaten arrest or leave a voicemail threatening legal action, and that a message which rushes or threatens you could be a scam.", SRC.IDENTIFY);

    // Gift cards or crypto. IDENTIFY: "HMRC will never ask you to pay with gift or payment vouchers"; checklist: "tells you to transfer money".
    if (f.giftCrypto) add(r, "red", "GOV.UK says HMRC will never ask you to pay with gift or payment vouchers, and that being told to transfer money is a sign of a scam.", SRC.IDENTIFY);

    // Refund link.
    if (f.refundLink) {
      if (ch === "text") add(r, "red", "GOV.UK says HMRC will never send a notification of a tax rebate by text, and not to open links in a text offering a refund.", SRC.REPORT); // REPORT, TEXTS
      else if (ch === "social") add(r, "red", "GOV.UK says HMRC never uses social media to offer a tax rebate.", SRC.REPORT); // REPORT, IDENTIFY
      else if (ch === "email") add(r, "red", "GOV.UK says not to click links in a tax rebate email. HMRC's genuine P800 refund emails do not include links to websites.", SRC.EMAILS); // EXAMPLES; EMAILS "Tax refund — P800": "It will not ... provide any links to websites"
      else if (ch === "phone") add(r, "red", "GOV.UK says scam calls may offer a tax refund and ask for bank or card details. If you cannot check who the caller is, GOV.UK suggests not speaking to them.", SRC.EXAMPLES); // EXAMPLES "Suspicious phone calls"
      else add(r, "amber", "Some genuine HMRC letters do invite you to claim a refund, but GOV.UK lists offering a refund as a sign of a possible scam. Look the letter up on GOV.UK's list of genuine letters.", SRC.LETTERS); // LETTERS (e.g. NISPAR1MM, CA4361); IDENTIFY checklist "offers a refund, tax rebate or grant"
    }

    // Bank or card details.
    if (f.bankDetails) {
      if (ch === "text") add(r, "red", "GOV.UK says HMRC will never ask you to disclose personal or payment information by text.", SRC.REPORT); // REPORT, TEXTS "HMRC will never ask for personal or financial information when we send text messages"
      else if (ch === "social") add(r, "red", "GOV.UK says HMRC never uses social media to request personal or financial information.", SRC.REPORT); // REPORT, IDENTIFY
      else if (ch === "phone") add(r, "red", "GOV.UK says HMRC's calls listed as genuine will not ask for personal or financial information, and that scam calls ask for bank or card details.", SRC.CALLS); // CALLS "never ask for personal or financial information during the call"; EXAMPLES
      else if (ch === "email") add(r, "amber", "GOV.UK says HMRC only asks for personal or payment information by email from an address ending in hmrc.gov.uk, and that fraudsters can fake the sender name. Most genuine HMRC emails say they will never ask for it.", SRC.REPORT); // REPORT; EXAMPLES "spoof a genuine email address or change the display name"; EMAILS
      else add(r, "amber", "A few genuine HMRC letters ask for bank details on a paper form, but asking for bank details is also a sign of a scam. Any request to send details to an email address not ending in hmrc.gov.uk is not genuine.", SRC.LETTERS); // LETTERS NISPAR1MM, VPCF1; IDENTIFY checklist
    }

    // QR codes. IDENTIFY: HMRC uses QR codes in letters, usually to GOV.UK guidance, and "You will never be taken to a page where you have to input personal information".
    if (f.qr) {
      if (ch === "letter") add(r, "green", "HMRC does put QR codes on some letters. They usually go to guidance on GOV.UK and never to a page asking for personal information. Check the letter is on GOV.UK's QR code list.", SRC.QR); // IDENTIFY, QR
      else add(r, "amber", "GOV.UK lists QR codes on HMRC letters and leaflets, not in texts, emails or messages. It asks you to send suspicious emails containing QR codes to phishing@hmrc.gov.uk.", SRC.IDENTIFY); // IDENTIFY, QR
    }

    // Call back number.
    if (f.callback) {
      if (ch === "letter") add(r, "green", "Genuine letters can give a phone number, but check it matches the number for that service on GOV.UK before you call.", SRC.LETTERS); // LETTERS e.g. IDMS99P, NI Refunds 1
      else add(r, "amber", "Some genuine HMRC texts, emails and voice messages ask you to call, but use the number on GOV.UK, not the one in the message.", SRC.CONTACT); // TEXTS "Debt Recovery"; MULTI "VAT visits"; CALLS "Debt management"; TEXTS survey texts "will not include any phone numbers"
    }

    // Child Benefit or HICBC. MULTI "High Income Child Benefit Charge — check if you need to pay": letter or text message,
    // 6 July 2026 to 31 December 2026, "You will not be asked for any personal or financial information."
    // TEXTS "Child Benefit" and EMAILS "Child Benefit claim updates" list confirmation texts and emails.
    if (f.childBenefit) {
      var hicbcOk = inWindow(date, HICBC_FROM, HICBC_TO);
      if ((ch === "letter" || ch === "text") && hicbcOk) add(r, "green", "HMRC says it may send a letter or text from 6 July to 31 December 2026 asking you to check if you need to pay the High Income Child Benefit Charge. So a letter about it can be genuine.", SRC.MULTI);
      else if (ch === "letter" || ch === "text") add(r, "amber", "HMRC's High Income Child Benefit Charge letters and texts are listed for 6 July to 31 December 2026, and this falls outside those dates.", SRC.MULTI);
      else if (ch === "email") add(r, "green", "HMRC may email to confirm a Child Benefit claim has been received. Its High Income Child Benefit Charge check is listed as a letter or text, not an email.", SRC.EMAILS);
      else add(r, "amber", "GOV.UK lists Child Benefit contact by letter, text and email, not by phone call or social media.", SRC.MULTI);
      if (f.bankDetails || f.refundLink || f.giftCrypto) add(r, "red", "HMRC says its High Income Child Benefit Charge letters and texts will not ask for any personal or financial information.", SRC.MULTI);
    }

    // Tax code change. MULTI "Changes to your tax code": email or text, "You will not be asked for personal, business or financial information."
    // QR "Letter P2 — tax code notice".
    if (f.taxCode) {
      if (ch === "email" || ch === "text" || ch === "letter") add(r, "green", "HMRC says it may email, text or write to you about a change to your tax code.", ch === "letter" ? SRC.QR : SRC.MULTI);
      else add(r, "amber", "GOV.UK lists tax code contact by letter, email or text, not by phone call or social media.", SRC.MULTI);
      if (f.bankDetails || f.refundLink || f.giftCrypto) add(r, "red", "HMRC says tax code messages will not ask for personal, business or financial information.", SRC.MULTI);
    }

    // MTD or VAT return. MULTI "VAT — missing return": letter, text or email from 10 August 2026, will not ask for bank details or a payment by text.
    // EMAILS "VAT Returns reminder", "Making Tax Digital for VAT"; QR "Making Tax Digital for Income Tax — customer awareness letter";
    // MULTI MTD for Income Tax research by letter or phone call from NatCen, Walnut or Verian.
    if (f.mtdVat) {
      if (ch === "social") add(r, "amber", "GOV.UK lists Making Tax Digital and VAT return contact by letter, email, text or research phone call, not social media.", SRC.MULTI);
      else add(r, "green", "HMRC says it may contact you about Making Tax Digital or a VAT return by " + (ch === "phone" ? "phone, but only for research calls from named agencies, which will not ask for financial information." : "letter, email or text."), SRC.MULTI);
      if (f.bankDetails || f.giftCrypto) add(r, "red", "HMRC says its VAT return reminders will not ask for personal, financial or bank details, or for a payment by text.", SRC.MULTI);
    }

    if (!r.length) add(r, "green", "Nothing you ticked is on GOV.UK's list of scam signs. GOV.UK says an unexpected message could still be a scam, so look it up on the genuine contacts list.", SRC.LIST); // IDENTIFY checklist "is unexpected"

    var level = "green";
    r.forEach(function (x) { if (RANK[x.level] > RANK[level]) level = x.level; });
    r.sort(function (a, b) { return RANK[b.level] - RANK[a.level]; });
    return { ok: true, level: level, verdict: VERDICT[level], reasons: r, report: REPORT_HOW[ch], src: SRC };
  }

  var api = { check: check, CHANNELS: CHANNELS, FLAGS: FLAGS, SRC: SRC, VERDICT: VERDICT, REPORT_HOW: REPORT_HOW, HICBC_FROM: HICBC_FROM, HICBC_TO: HICBC_TO };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.HMRCCheck = api;
})(this);
