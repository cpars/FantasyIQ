# 🏈 Fantasy Sports Tracker

A full-stack fantasy sports tracking web app built with Flask, PostgreSQL, and (eventually) React. Users can create fantasy teams, add players, and track real-time stats from live sports APIs.

## 🚀 Features

- User authentication system
- Create and manage fantasy teams
- Add/remove players to your team
- View real-time player stats (via public sports APIs)
- RESTful API with Flask
- PostgreSQL database integration
- Planned: Frontend with React

## 🛠️ Tech Stack

- **Backend:** Flask, SQLAlchemy
- **Database:** PostgreSQL
- **API:** TBD (balldontlie, Sportsdata.io, etc.)
- **Frontend:** Coming soon (React + Tailwind CSS)
- **Deployment:** Planned (Render)

## 📁 Project Structure

```
fantasy-sports-tracker/
├── backend/
│   ├── app.py
│   ├── models/
│   └── routes/
├── .env
├── .gitignore
├── README.md
└── requirements.txt
```

## 🔒 Environment Variables

Create a `.env` file at the root:

```
DATABASE_URL=postgresql://username:password@localhost:5432/fantasy_tracker
```

## 🧪 Run the Project

```bash
# Activate virtual environment
source venv/Scripts/activate  # Windows
source venv/bin/activate      # Mac/Linux

# Run Flask
cd backend
python app.py
```

## 👨‍💻 Author

Corey Parsons  
[Portfolio](#) | [GitHub](https://github.com/coreyparsons) | [LinkedIn](#)
