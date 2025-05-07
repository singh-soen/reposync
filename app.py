from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from flask import Flask, request, render_template, redirect
import smtplib
from email.message import EmailMessage

app = Flask(__name__)
CORS(app)

# MySQL configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'sswsj234okm'  # Your MySQL password
app.config['MYSQL_DB'] = 'your_database'      # Your database name

# Initialize MySQL
mysql = MySQL(app)

# ------------------ SIGNUP ------------------
@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()

        full_name = data['name']
        email = data['email']
        password = data['password']
        confirm_password = data['confirm_password']

        if password != confirm_password:
            return jsonify({"message": "Passwords do not match"}), 400

        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user:
            return jsonify({"message": "Email already exists"}), 400

        cursor.execute("INSERT INTO users (full_name, email, password) VALUES (%s, %s, %s)",
                       (full_name, email, password))
        mysql.connection.commit()
        cursor.close()

        return jsonify({"message": "User created successfully"}), 201

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500

# ------------------ LOGIN ------------------
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        email = data['email']
        password = data['password']

        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user:
            if password == user[3]:  # user[3] is password field
                return jsonify({"message": "Login successful", "email": user[2], "full_name": user[1]}), 200
            else:
                return jsonify({"message": "Invalid password"}), 401
        else:
            return jsonify({"message": "User not found"}), 404

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500

# ------------------ SAVE REPOSITORY ------------------
@app.route('/save_repository', methods=['POST'])
def save_repository():
    try:
        data = request.get_json()

        email = data.get('email')
        repo_name = data.get('repo_name')
        html_code = data.get('html_code')
        css_code = data.get('css_code')
        js_code = data.get('js_code')

        if not all([email, repo_name]):
            return jsonify({"message": "Email and Repository Name are required."}), 400

        cursor = mysql.connection.cursor()
        cursor.execute("""
            INSERT INTO repositories (email, repo_name, html_code, css_code, js_code)
            VALUES (%s, %s, %s, %s, %s)
        """, (email, repo_name, html_code, css_code, js_code))
        mysql.connection.commit()
        cursor.close()

        return jsonify({"message": "Repository saved successfully!"}), 201

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"message": "Failed to save repository.", "error": str(e)}), 500
    
    # ------------------ GET REPOSITORIES ------------------
@app.route('/get_repositories', methods=['POST'])
def get_repositories():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({"message": "Email is required."}), 400

        cursor = mysql.connection.cursor()
        cursor.execute("SELECT repo_name FROM repositories WHERE email = %s", (email,))
        repositories = cursor.fetchall()
        cursor.close()

        repo_list = [{"repo_name": repo[0]} for repo in repositories]

        return jsonify({"repositories": repo_list}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"message": "Failed to fetch repositories.", "error": str(e)}), 500

# ------------------ UPDATE REPOSITORY ------------------
@app.route('/update_repository', methods=['POST'])
def update_repository():
    try:
        data = request.get_json()

        email = data.get('email')
        repo_name = data.get('repo_name')
        html_code = data.get('html_code')
        css_code = data.get('css_code')
        js_code = data.get('js_code')

        cursor = mysql.connection.cursor()
        cursor.execute("""
            UPDATE repositories
            SET html_code = %s, css_code = %s, js_code = %s
            WHERE email = %s AND repo_name = %s
        """, (html_code, css_code, js_code, email, repo_name))
        mysql.connection.commit()
        cursor.close()

        return jsonify({"message": "Repository updated successfully!"}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"message": "Failed to update repository.", "error": str(e)}), 500

# ------------------ GET SINGLE REPOSITORY ------------------
@app.route('/get_repository', methods=['POST'])
def get_repository():
    try:
        data = request.get_json()
        email = data.get('email')
        repo_name = data.get('repo_name')

        if not all([email, repo_name]):
            return jsonify({"message": "Email and Repository Name are required."}), 400

        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT html_code, css_code, js_code 
            FROM repositories 
            WHERE email = %s AND repo_name = %s
        """, (email, repo_name))
        repo = cursor.fetchone()
        cursor.close()

        if repo:
            return jsonify({
                "repository": {
                    "html_code": repo[0],
                    "css_code": repo[1],
                    "js_code": repo[2]
                }
            }), 200
        else:
            return jsonify({"message": "Repository not found"}), 404

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"message": "Failed to fetch repository.", "error": str(e)}), 500

# ------------------ DELETE REPOSITORY ------------------
@app.route('/delete_repository', methods=['POST'])
def delete_repository():
    try:
        data = request.get_json()
        email = data.get('email')
        repo_name = data.get('repo_name')

        if not all([email, repo_name]):
            return jsonify({"message": "Email and Repository Name are required."}), 400

        cursor = mysql.connection.cursor()
        cursor.execute("""
            DELETE FROM repositories
            WHERE email = %s AND repo_name = %s
        """, (email, repo_name))
        mysql.connection.commit()
        cursor.close()

        return jsonify({"message": "Repository deleted successfully!"}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"message": "Failed to delete repository.", "error": str(e)}), 500

@app.route('/get_all_repositories', methods=['POST'])
def get_all_repositories():
    try:
        data = request.get_json()
        query = data.get('query', '').lower()

        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT email, repo_name FROM repositories
        """)
        all_repos = cursor.fetchall()
        cursor.close()

        filtered = []
        for email, repo_name in all_repos:
            if query in email.lower() or query in repo_name.lower():
                filtered.append({"email": email, "repo_name": repo_name})

        return jsonify({"repositories": filtered}), 200

    except Exception as e:
        return jsonify({"message": "Failed to fetch public repositories.", "error": str(e)}), 500

# ------------------ MAIN ------------------
if __name__ == "__main__":
    app.run(debug=True)
