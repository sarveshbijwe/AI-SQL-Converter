import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your actual API Key
const API_KEY = 'Put_Your_Gemini_API';

// AIzaSyClUvKgt-hqQbWS3o9McgYFRZrN4UBAkF8

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

document.getElementById('convert-btn').addEventListener('click', async function() {
    const message = document.getElementById('input-message').value;
    if (message.trim()) {
        const roleDescription = `
        You are an AI that converts natural language into SQL queries. 
        Your output should only contain valid SQL commands without any additional explanations or text. 
        For example:
        - Input: "Create a table for students with columns: id, name, age, and grade."
        - Output: "CREATE TABLE students (id INT, name VARCHAR(255), age INT, grade VARCHAR(10));"
        - Input: "Insert John Doe into the students table with age 20 and grade A."
        - Output: "INSERT INTO students (name, age, grade) VALUES ('John Doe', 20, 'A');"
        `;
        
        try {
            const result = await model.generateContent(`${roleDescription}\n${message}`);
            const response = await result.response;
            const sqlCommand = await response.text();

            document.getElementById('sql-command').textContent = sqlCommand;

            // Parse the SQL command and generate the schema
            const schema = parseSQL(sqlCommand);
            drawTableSchema(schema);
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('sql-command').textContent = 'An error occurred while generating the SQL command.';
        }
    } else {
        alert('Please enter a query.');
    }
});


//API program end zala aahe

function parseSQL(sqlCommand) {
    // This is a basic example of parsing SQL.
    // In practice, you may need a more sophisticated parser for complex SQL commands.
    const schema = { tableName: '', columns: [] };

    const createTableMatch = sqlCommand.match(/CREATE TABLE (\w+) \((.+)\)/i);
    if (createTableMatch) {
        schema.tableName = createTableMatch[1];
        const columnsPart = createTableMatch[2];
        const columns = columnsPart.split(',').map(col => col.trim());
        columns.forEach(col => {
            const parts = col.split(' ');
            schema.columns.push({
                name: parts[0],
                type: parts[1],
                constraints: parts.slice(2).join(' ')
            });
        });
    }
    return schema;
}

function drawTableSchema(schema) {
    const canvas = document.getElementById('table-schema');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = '16px Arial';
    ctx.fillStyle = '#000';

    let x = 20;
    let y = 20;
    ctx.fillText(`Table: ${schema.tableName}`, x, y);

    y += 30;
    schema.columns.forEach(column => {
        ctx.fillRect(x, y, 360, 30);
        ctx.fillStyle = '#fff';
        ctx.fillText(`${column.name} (${column.type}) ${column.constraints || ''}`, x + 10, y + 20);
        ctx.fillStyle = '#000';
        y += 40;
    });
}

document.getElementById('download-btn').addEventListener('click', function() {
    const canvas = document.getElementById('table-schema');
    const link = document.createElement('a');
    link.download = `table_schema.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
});
