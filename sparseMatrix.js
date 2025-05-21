const fs = require('fs');

class SparseMatrix {
    constructor(filePath = '', rows = 0, cols = 0) {
        this.rows = rows;
        this.cols = cols;
        this.nonZero = {}; // Stores non-zero values using "row,col" as key

        if (filePath) {
            this.loadFromFile(filePath);
        }
    }

    // Load matrix data from a file
    loadFromFile(filePath) {
        const lines = fs.readFileSync(filePath, 'utf-8').split('\n').map(line => line.trim());

        // Read matrix dimensions
        this.rows = parseInt(lines[0].split('=')[1]);
        this.cols = parseInt(lines[1].split('=')[1]);

        if (isNaN(this.rows) || isNaN(this.cols)) {
            throw new Error('Invalid matrix dimensions format.');
        }

        // Parse remaining lines as non-zero entries
        for (let i = 2; i < lines.length; i++) {
            const line = lines[i];
            if (line === '')
                continue; // Skip empty lines

            // Check for correct parentheses format
            if (!line.startsWith('(') || !line.endsWith(')')) {
                throw new Error(`Input file has wrong format`);
            }

            const values = line.slice(1, -1).split(',').map(v => v.trim());

            if (values.length !== 3) {
                throw new Error(`Invalid number of values at line ${i + 1}. Expected 3 values: row,col,value`);
            }

            const [row, col, value] = values.map(Number);

            // Check if any value is not an integer
            if (!Number.isInteger(row) || !Number.isInteger(col) || !Number.isInteger(value)) {
                throw new Error('Input file has wrong format');
            }
            this.set(row, col, value);
        }
    }

    // Set a matrix value (remove the ones that are zero)
    set(row, col, value) {
        const key = `${row},${col}`;
        if (value !== 0) {
            this.nonZero[key] = value;
        } else {
            delete this.nonZero[key];
        }
    }

    // Get a value, defaulting to 0
    get(row, col) {
        return this.nonZero[`${row},${col}`] || 0;
    }

    // Add two matrices
    add(secondMatrix) {
        if (this.rows !== secondMatrix.rows || this.cols !== secondMatrix.cols) {
            throw new Error("Matrix dimensions must match for addition.");
        }

        const newMatrix = new SparseMatrix('', this.rows, this.cols);
        const keys = new Set([...Object.keys(this.nonZero), ...Object.keys(secondMatrix.nonZero)]);

        keys.forEach(key => {
            const [row, col] = key.split(',').map(Number);
            const sum = this.get(row, col) + secondMatrix.get(row, col);
            newMatrix.set(row, col, sum);
        });

        return newMatrix;
    }

    // Subtract another matrix
    subtract(secondMatrix) {
        if (this.rows !== secondMatrix.rows || this.cols !== secondMatrix.cols) {
            throw new Error("Matrix dimensions must match for subtraction.");
        }

        const newMatrix = new SparseMatrix('', this.rows, this.cols);
        const keys = new Set([...Object.keys(this.nonZero), ...Object.keys(secondMatrix.nonZero)]);

        keys.forEach(key => {
            const [row, col] = key.split(',').map(Number);
            const diff = this.get(row, col) - secondMatrix.get(row, col);
            newMatrix.set(row, col, diff);
        });

        return newMatrix;
    }

    // Multiply two matrices
    multiply(secondMatrix) {
        if (this.cols !== secondMatrix.rows) {
            throw new Error("First matrix columns must match second matrix rows.");
        }

        const newMatrix = new SparseMatrix('', this.rows, secondMatrix.cols);

        // Group B matrix entries by row for fast lookup
        const bRows = {};
        for (let key in secondMatrix.nonZero) {
            const [row, col] = key.split(',').map(Number);
            if (!bRows[row]) bRows[row] = [];
            bRows[row].push([col, secondMatrix.nonZero[key]]);
        }

        // Perform multiplication using non-zero entries
        for (let aKey in this.nonZero) {
            const [rowA, colA] = aKey.split(',').map(Number);
            const aVal = this.nonZero[aKey];

            if (bRows[colA]) {
                for (let [colB, bVal] of bRows[colA]) {
                    const current = newMatrix.get(rowA, colB);
                    newMatrix.set(rowA, colB, current + aVal * bVal);
                }
            }
        }

        return newMatrix;
    }

    // Write matrix content to a file
    saveToFile(outputPath) {
        const lines = [`rows=${this.rows}`, `cols=${this.cols}`];

        for (let key of Object.keys(this.nonZero)) {
            const [row, col] = key.split(',');
            lines.push(`(${row}, ${col}, ${this.nonZero[key]})`);
        }

        fs.writeFileSync(outputPath, lines.join('\n'));
    }
}

module.exports = SparseMatrix;
