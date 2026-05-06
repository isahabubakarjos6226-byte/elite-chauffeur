# Elite Chauffeur - PHP Version

A luxury car rental and chauffeur service management system built with PHP and MySQL.

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache with mod_rewrite enabled
- cPanel or aaPanel hosting

## Installation

### Step 1: Upload Files

1. Download and extract the ZIP file
2. Upload all files to your web hosting via FTP or File Manager
3. Upload to `public_html` folder (or your domain's root folder)

### Step 2: Create Database

1. Log in to cPanel/aaPanel
2. Go to **MySQL Databases**
3. Create a new database (e.g., `elite_chauffeur`)
4. Create a new database user with a strong password
5. Add the user to the database with **ALL PRIVILEGES**

### Step 3: Import Database Schema

1. Go to **phpMyAdmin**
2. Select your new database
3. Click **Import** tab
4. Upload the file `database/schema.sql`
5. Click **Go** to import

### Step 4: Configure Database Connection

1. Open `config/database.php`
2. Update the following values:

```php
define('DB_HOST', 'localhost');        // Usually 'localhost'
define('DB_NAME', 'your_database');    // Your database name
define('DB_USER', 'your_username');    // Your database user
define('DB_PASS', 'your_password');    // Your database password
```

### Step 5: Set Permissions

Make sure these folders are writable (chmod 755 or 775):
- `uploads/`
- `uploads/cars/`
- `uploads/services/`

### Step 6: Access Your Site

- **Frontend**: `https://yourdomain.com/`
- **Admin Panel**: `https://yourdomain.com/admin/`

### Default Admin Login

- **Email**: admin@elitechauffeur.com
- **Password**: admin123

**IMPORTANT**: Change the admin password immediately after first login!

## Features

### Public Website
- Homepage with booking form
- Fleet gallery with car details
- Services page
- Contact form
- Multi-language support (English, French, German, Arabic)
- RTL support for Arabic
- Mobile responsive design

### Admin Panel
- Dashboard with statistics
- Car management (add, edit, delete)
- Reservation management
- Service management
- Driver management
- Contact messages
- Site settings (branding, currency, chauffeur service toggle)

### Booking System
- Transfer booking with distance calculation
- Daily rental booking
- Optional chauffeur service
- Real-time price calculation
- Price breakdown display

## File Structure

```
php-version/
├── admin/                  # Admin panel
│   ├── includes/          # Admin header/footer
│   ├── index.php          # Dashboard
│   ├── cars.php           # Car management
│   ├── reservations.php   # Reservations
│   ├── services.php       # Services
│   ├── drivers.php        # Drivers
│   ├── messages.php       # Contact messages
│   ├── settings.php       # Site settings
│   ├── login.php          # Admin login
│   └── logout.php         # Logout
├── assets/
│   ├── css/style.css      # Main stylesheet
│   └── js/main.js         # JavaScript
├── config/
│   └── database.php       # Database configuration
├── database/
│   └── schema.sql         # Database schema
├── includes/
│   ├── header.php         # Public header
│   └── footer.php         # Public footer
├── lang/
│   ├── en.php             # English
│   ├── fr.php             # French
│   ├── de.php             # German
│   └── ar.php             # Arabic
├── uploads/               # Uploaded images
├── index.php              # Homepage
├── fleet.php              # Fleet listing
├── fleet-detail.php       # Car details
├── services.php           # Services page
├── contact.php            # Contact page
├── book.php               # Booking form
├── .htaccess              # Apache config
└── README.md              # This file
```

## Customization

### Adding New Languages

1. Copy `lang/en.php` to `lang/xx.php` (where xx is the language code)
2. Translate all strings in the new file
3. Add the language to the language switcher in `includes/header.php`

### Changing Colors

Edit `assets/css/style.css` and modify the CSS variables at the top:

```css
:root {
    --bg-primary: #0a0a0a;
    --accent-gold: #d4af37;
    /* ... other colors ... */
}
```

### Adding New Services

1. Log in to Admin Panel
2. Go to Services
3. Click "Add Service"
4. Fill in the details and save

## Troubleshooting

### White/Blank Page
- Check PHP error logs
- Ensure database credentials are correct
- Verify PHP version is 7.4+

### Images Not Loading
- Check file permissions on `uploads/` folder
- Verify image URLs in database

### 500 Internal Server Error
- Check `.htaccess` compatibility with your server
- Review Apache error logs

### Database Connection Error
- Verify database credentials in `config/database.php`
- Ensure database user has proper permissions
- Check if MySQL service is running

## Security Recommendations

1. Change default admin password immediately
2. Use HTTPS (enable in `.htaccess`)
3. Keep PHP and MySQL updated
4. Regular database backups
5. Use strong passwords for database

## Support

For issues or questions, please contact the developer.

## License

This project is provided as-is for use on your own servers.
