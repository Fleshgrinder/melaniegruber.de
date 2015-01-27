<?php

/*!
 * This is free and unencumbered software released into the public domain.
 *
 * Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form
 * or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
 *
 * In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright
 * interest in the software to the public domain. We make this dedication for the benefit of the public at large and to
 * the detriment of our heirs and successors. We intend this dedication to be an overt act of relinquishment in
 * perpetuity of all present and future rights to this software under copyright law.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * For more information, please refer to <http://unlicense.org/>
 */

/**
 * Script to handle sending of emails via the contact form.
 *
 * *NOTE:* that this script can only be called via POST, this is ensured by nginx.
 *
 * @author Richard Fussenegger <richard@fussenegger.info>
 * @copyright 2014 Richard Fussenegger
 * @license http://unlicense.org/ Unlicense
 */

// Include the Composer generated auto-loader.
require __DIR__ . "/vendor/autoload.php";

// Validate the user submitted email address.
$from = filter_input(INPUT_POST, "email", FILTER_VALIDATE_EMAIL);
if ($from !== $_POST["email"] || $from === null || $from === false) {
    $errors["email"] = true;
}

// Sanitize the user submitted name.
$name = filter_input(INPUT_POST, "name", FILTER_SANITIZE_STRING, FILTER_FLAG_STRIP_LOW);
if ($name !== $_POST["name"] || $name === null || $name === false) {
    $errors["name"] = true;
}

// Sanitize the user submitted message.
$message = strip_tags(filter_input(INPUT_POST, "message", FILTER_SANITIZE_STRING));
if ($message !== $_POST["message"] || $message === null || $message === false) {
    $errors["message"] = true;
}

// Determine if this request was made via AJAX or not.
$ajax = filter_input(INPUT_POST, "ajax", FILTER_VALIDATE_BOOLEAN);

// Abort if there are any issues.
if (isset($errors)) {
    if ($ajax) {
        return json_encode($errors);
    } else {
        // TODO: We need a way to mark exactly what is incorrect!
        return file_get_contents(__DIR__ . "/contact.html");
    }
}

// Everything seems to be valid, no need for the user to wait.
if (!$ajax) {
    return file_get_contents(__DIR__ . "/contact-sent.html");
}
fastcgi_finish_request();

// Load configuration.
$config = json_decode(file_get_contents(__DIR__ . "/contact.json"));

// Further sanitize the user submitted message.
$message = nl2br($message, false);
$message = trim(preg_replace('/\s\s+/m', " ", preg_replace('/[\n\r\t\x{00}\x{0B}]+/m', " ", $message)));
$message = str_replace("<br>", '\n', $message);

// Store a copy of the message on the server.
file_put_contents(__DIR__ . "/contact/" . time() . ".txt", json_encode([
    "email"   => $from,
    "name"    => $name,
    "message" => $message,
]));

// Note that we do not care if the sending succeeded, that is why we stored a copy.
$mailer = new PHPMailer();
$mailer->isSMTP();
$mailer->Host = $config->smtp->host;
$mailer->SMTPAuth = true;
$mailer->Username = $config->smtp->user;
$mailer->Password = $config->smtp->password;
$mailer->SMTPSecure = $config->smtp->secure;
$mailer->Port = $config->smtp->port;
$mailer->setFrom($from, $name);
$mailer->addAddress($config->recipient->email, $config->recipient->name);
$mailer->isHTML(true);
$mailer->Subject = "New Contact from Website";
$mailer->Body = $message;
$mailer->AltBody = $message;
$mailer->send();
