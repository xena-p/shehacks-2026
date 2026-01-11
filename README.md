# ResUse U – SheHacks 2026
ReUse U is a student-focused platform designed to make borrowing and lending items within a university community fast, simple, and secure. It connects students who want to lend items they own with those who need them, reducing waste and promoting a sustainable, sharing-focused campus culture.

---
# Running the project

In order to run the *ResUse U* project, please follow the installation and setup guide below.

### Clone the Repository

```bash
git clone https://github.com/xena-p/shehacks-2026.git
```

## Setup Backend
```bash
cd shehacks-2026
cd backend
python -m venv venv
```
Then, activate the virtual environment, and install dependencies (windows)
```bash
venv\Scripts\activate
pip install -r requirements.txt
```
If om macOS / Linux:
```bash
source venv/bin/activate
```
### Create .env file 
In the file explorer, create a file called .env, inside of \backend.

First make sure you select file name extension in view
<img width="883" height="635" alt="image" src="https://github.com/user-attachments/assets/ffbe87ea-8b14-4157-99f9-8b74cf70a316" />

Then, create the file.
<img width="195" height="73" alt="image" src="https://github.com/user-attachments/assets/cd264a4d-cb83-4432-af29-d5c2b0befe89" />


Select yes.
<img width="852" height="523" alt="image" src="https://github.com/user-attachments/assets/033d90f6-c889-41ab-8c10-cc747207f7e8" />

You will paste your MongoDB Atlas DATABASE USER into the file.

MONGO_PASS=your_database_user_password_here

THEN:
```bash
flask run
```

## Running Frontend
```bash
cd shehacks-2026/frontend
npm install
npm run dev
```
# Features
### Sign-Up
<img width="306" height="703" alt="image" src="https://github.com/user-attachments/assets/0521c68f-e3ef-4ebb-89b7-7a0bbeb40a0d" />

### Login
<img width="308" height="320" alt="image" src="https://github.com/user-attachments/assets/5b9147ff-3b92-45cd-9d31-11c6bb4adf8e" />

# Dependencies 
```bash
pip install -r requirements.txt
```
