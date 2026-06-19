# Design History

## Tool Used

Google Stitch

## Purpose

Used for UI designing.

## Questions

### 1. Initial SaaS UI Design

Web application for SaaS-style content management platform for wellness creators. A creator can be a yoga teacher, meditation coach, sleep coach, fitness instructor, or wellness educator.

What can a creator do?

Sign up and log in: A creator creates an admin account and enters their private workspace.

Create programs: A program is like a wellness course, for example: 30-Day Sleep Reset, Beginner Yoga Foundations, Morning Meditation Series.

Edit and delete programs: The creator can update program details or remove a program.

Add sessions to a program: Sessions are lessons inside a program. Each session has title, duration, ordered position, instructor name, tags, media type, and media URL.

Reorder sessions: The creator can change lesson order inside a program, ideally using drag-and-drop or a simple reorder UI.

Bulk import sessions from CSV: The creator uploads a CSV file to create many sessions at once. The system returns row-level validation errors.

View audit logs: The creator can see admin write actions such as program created, session updated, import completed, or upload URL requested. Logs can be filtered by date and action type.

Use google font sans. Use light stroke icons. Add sidebar and navbar.

---

### 2. Import Sessions Modal

Need to add import session modal. Change "Bulk import" to "Import Csv".

1. Modal title: "Import Sessions from CSV"

2. Short description: "Upload a CSV file to create multiple sessions for this program. Valid rows will be imported, and rows with errors will be shown below."

3. Expected CSV format section:

Show the required and optional columns clearly.

Required columns:

- title
- duration

Optional columns:

- position
- instructorName
- tags
- mediaType
- mediaUrl

Show a small sample CSV preview inside the modal:

```csv
title,duration,position,instructorName,tags,mediaType,mediaUrl
Welcome Session,5,1,Anu,"sleep,beginner",video,example.com/welcome.mp4
Breathing Practice,12,2,Anu,"breathing,sleep",audio,https://example.com/breathing.mp3
```

4. File upload input:

Allow only `.csv` files. Show selected file name after user chooses a file.

5. Import button:

Button text should be "Import Sessions". Disable the button if no file is selected. Show loading state while import is in progress.

6. Success state:

After successful import, show a summary card:

```text
Import completed
Created: X sessions
Failed: Y rows
```

7. Error display:

If some rows failed validation, show a table below the summary.

Add logout button at bottom. Also at top, Add "Welcome Lumina Wellness"

---

### 3. Login Page

Add Login page. You can give left side for login form section and right side covering image which can be related for the SAAS application.

---

### 4. Edit Session Modal

Add a modal for edit session. It should include Title, duration (Hours based), Tag (New tag can be added if not present in dropdown), File adding with preview (vedio, image, audio can be added).

---

### 5. Delete Button

Change selected span to delete button for 3 rows.

---

### 6. Multiple Image Upload

Multiple images can be uploaded and images should be previewd.

---

### 7. Edit Program Button

Add a edit program button near. Make sure Ui is not tight. You can adjust button position to up or down.

---

### 8. Move Section to Navbar

Move this to top navbar section.

---

### 9. Edit Program Detail Modal

Add edit button in this page for editing program detail. In modal there should be field for title, description, photo.
