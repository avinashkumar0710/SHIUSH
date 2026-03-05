<?php
/**
 * SHIUSH Clinics — One-Time Database Setup
 *
 * INSTRUCTIONS:
 * 1. Fill in your DB credentials in api/config.php
 * 2. Upload ALL files to InfinityFree via FTP
 * 3. Visit https://yourdomain.infinityfreeapp.com/setup.php in a browser
 * 4. Once you see "Setup complete!" — DELETE this file from the server!
 */
require_once __DIR__ . '/api/config.php';

$dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
$pdo = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

// ── Create tables ────────────────────────────────────────────────────────────
$pdo->exec("
CREATE TABLE IF NOT EXISTS settings (
  `key`  VARCHAR(100) NOT NULL PRIMARY KEY,
  value  LONGTEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

$pdo->exec("
CREATE TABLE IF NOT EXISTS appointments (
  id        VARCHAR(10)  NOT NULL PRIMARY KEY,
  name      VARCHAR(255) NOT NULL,
  phone     VARCHAR(30)  NOT NULL,
  service   VARCHAR(255) DEFAULT '',
  date      VARCHAR(50)  DEFAULT '',
  time      VARCHAR(50)  DEFAULT '',
  message   TEXT         DEFAULT '',
  status    VARCHAR(20)  DEFAULT 'new',
  timestamp DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

$pdo->exec("
CREATE TABLE IF NOT EXISTS feedback (
  id        VARCHAR(10)  NOT NULL PRIMARY KEY,
  name      VARCHAR(255) NOT NULL,
  message   TEXT         NOT NULL,
  timestamp DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// ── Insert default site content (only if not already set) ────────────────────
$existing = $pdo->query("SELECT COUNT(*) FROM settings WHERE `key`='site_content'")->fetchColumn();

if (!$existing) {
    $default = [
        "clinic" => [
            "name" => "SHIUSH CLINICS",
            "tagline" => "Health is the root of happiness",
            "phone1" => "8305194236",
            "phone2" => "7646890193",
            "email" => "shuklanitish762@gmail.com",
            "address" => "Link Road Camp 2, Bhilai, Chhattisgarh",
            "timings" => "Mon\u2013Sat, 10 AM \u2013 7 PM",
            "fee_messaging" => 100,
            "fee_video" => 500
        ],
        "doctor" => [
            "name" => "Dr. Nitish Shukla",
            "degree" => "MBBS",
            "title" => "General Physician",
            "bio" => "Dr. Nitish Shukla is a compassionate and experienced General Physician committed to providing quality healthcare to all. With a focus on preventive medicine and patient-centered care, he combines modern diagnostics with a personal approach to wellness \u2014 ensuring every patient feels heard and respected.",
            "badges" => ["MBBS Qualified", "General Physician", "Preventive Medicine", "Patient-Centered"]
        ],
        "hero" => [
            "badge" => "Now Accepting Patients",
            "description" => "Expert healthcare led by Dr. Nitish Shukla, MBBS \u2014 providing compassionate consultations, preventive care, and chronic condition management for the Bhilai community.",
            "typewriter_phrases" => ["General Physician", "Preventive Medicine", "Compassionate Care", "Patient-Centered Wellness"]
        ],
        "stats" => ["patients" => 500, "years" => 5, "starting_fee" => 100, "days_per_week" => 6],
        "about" => [
            "title" => "Welcome to SHIUSH Clinics",
            "subtitle" => "We are dedicated to providing compassionate and professional healthcare to our community. From routine checkups to chronic condition management, we\u2019re here for you."
        ],
        "services" => [
            ["icon" => "\ud83e\udd12", "name" => "General Consultation", "desc" => "Diagnosis and treatment for fever, infections, cold, flu, and common ailments."],
            ["icon" => "\ud83d\udc8a", "name" => "Chronic Disease Management", "desc" => "Ongoing care and monitoring for diabetes, hypertension, and other long-term conditions."],
            ["icon" => "\ud83d\udee1\ufe0f", "name" => "Preventive Healthcare", "desc" => "Routine checkups, health screenings, and vaccinations to keep you healthy."],
            ["icon" => "\ud83d\udcf9", "name" => "Video Consultation", "desc" => "Consult Dr. Shukla from the comfort of your home. Just \u20b9500 per session."],
            ["icon" => "\ud83d\udcac", "name" => "Online Messaging", "desc" => "Quick health queries answered via WhatsApp or message. Just \u20b9100."],
            ["icon" => "\ud83e\ude79", "name" => "Burn & Wound Care", "desc" => "Expert treatment and follow-up for burns, wounds, and post-injury recovery."]
        ],
        "faq" => [
            ["question" => "\ud83d\udd50 What are your consultation timings?", "answer" => "We are open Monday to Saturday, 10:00 AM to 7:00 PM. We are closed on Sundays."],
            ["question" => "\ud83d\udcb0 What are the consultation fees?", "answer" => "\u20b9100 for messaging and \u20b9500 for video consultations."],
            ["question" => "\ud83d\udccb Do I need to bring any documents?", "answer" => "Please bring any previous prescriptions and recent medical reports if available."],
            ["question" => "\ud83d\udcf9 How do I do a video consultation?", "answer" => "Book via the appointment form or WhatsApp us at 8305194236."],
            ["question" => "\ud83d\udccd Where are you located?", "answer" => "Link Road Camp 2, Bhilai, Chhattisgarh."]
        ],
        "warrior" => [
            "name" => "Ayush",
            "age" => "Age 7",
            "condition" => "Burn Victim Recovery",
            "story" => "Ayush, a 7-year-old boy, came to SHIUSH Clinics after suffering severe burns. Through expert care and compassionate, personalized treatment, he has made a truly remarkable recovery.",
            "quote" => "\u201cHis story is a true testament to the healing power of modern medicine and personalized care.\u201d \u2014 Dr. Nitish Shukla"
        ],
        "news" => [
            ["tag" => "urgent", "tag_label" => "\ud83d\udd34 Tomorrow", "title" => "Free Medical Checkup Camp!", "body" => "Join us for a free medical checkup camp open to all community members.", "meta" => "\ud83d\udccd Link Road Camp 2, Bhilai"],
            ["tag" => "info", "tag_label" => "\ud83c\udf89 Special Offer", "title" => "50% Discount on All Lab Tests", "body" => "Avail 50% off on all routine lab tests during the camp.", "meta" => "\ud83c\udff7\ufe0f Valid during camp only"],
            ["tag" => "update", "tag_label" => "\ud83d\udccb Clinic Update", "title" => "Video Consultations 6 Days a Week", "body" => "Dr. Shukla is now available for video consultations Mon\u2013Sat.", "meta" => "\ud83d\udcbb \u20b9500/session"]
        ],
        "admin_password" => "admin@shiush"
    ];

    $stmt = $pdo->prepare("INSERT INTO settings (`key`, value) VALUES ('site_content', :v)");
    $stmt->execute([':v' => json_encode($default, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
}

echo "
<!DOCTYPE html><html><head><meta charset='utf-8'>
<title>SHIUSH Setup</title>
<style>body{font-family:Arial,sans-serif;max-width:600px;margin:60px auto;padding:20px;background:#f1f5f9;}
.box{background:#fff;border-radius:12px;padding:32px;box-shadow:0 4px 20px rgba(0,0,0,0.1);}
h2{color:#0B1F3A;margin-top:0;}
.ok{color:#00A88B;font-weight:bold;font-size:1.2rem;}
.warn{background:#FEF9C3;border:1px solid #FCD34D;border-radius:8px;padding:14px;margin-top:20px;color:#92400E;}
</style></head><body>
<div class='box'>
  <h2>🏥 SHIUSH Clinics — Setup</h2>
  <p class='ok'>✅ Setup complete! Database tables created and default content loaded.</p>
  <div class='warn'>
    ⚠️ <strong>Security:</strong> Delete <code>setup.php</code> from your server immediately!
    Do not leave this file online.
  </div>
  <p>You can now visit:<br>
     🌐 <a href='/'>Your website</a><br>
     ⚙️ <a href='/admin/'>Admin Panel</a> &mdash; password: <code>admin@shiush</code>
  </p>
</div></body></html>";
