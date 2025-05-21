const path = require('path');
const fs = require('fs');
const readline = require('readline');
const SparseMatrix = require('./sparseMatrix');

// question prompt using the built-in readline module
function ask(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => rl.question(question, answer => {
        rl.close();
        resolve(answer);
    }));
}

async function main() {
    console.log("\nOperations:\n1. Add\n2. Subtract\n3. Multiply");

    const choice = (await ask("Select operation (1-3): ")).trim();

    if (!['1', '2', '3'].includes(choice)) {
        console.log("Invalid option.");
        return;
    }

    const file1 = (await ask("Enter first matrix file: ")).trim();
    const file2 = (await ask("Enter second matrix file: ")).trim();

    try {
        const firstMatrix = new SparseMatrix(file1);
        const secondMatrix = new SparseMatrix(file2);

        const resultDir = 'resultsOutputs';
        if (!fs.existsSync(resultDir)) fs.mkdirSync(resultDir);

        let result, filename;

        if (choice === '1') {
            result = firstMatrix.add(secondMatrix);
            filename = `${path.basename(file1, '.txt')}_plus_${path.basename(file2, '.txt')}.txt`;
        } else if (choice === '2') {
            result = firstMatrix.subtract(secondMatrix);
            filename = `${path.basename(file1, '.txt')}_minus_${path.basename(file2, '.txt')}.txt`;
        } else {
            result = firstMatrix.multiply(secondMatrix);
            filename = `${path.basename(file1, '.txt')}_times_${path.basename(file2, '.txt')}.txt`;
        }

        const outPath = path.join(resultDir, filename);
        result.saveToFile(outPath);
        console.log(`Result saved to ${outPath}`);

    } catch (err) {
        console.error("Error:", err.message);
    }
}

main();


