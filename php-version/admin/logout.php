<?php
require_once '../config/database.php';

// Clear session
session_unset();
session_destroy();

// Redirect to login
redirect('/admin/login.php');
