import { Chess } from "chess.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { db } from "../src";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
    // reset db
    await db.chess.opening.deleteMany();

    // read data from a-e.tsv files
    const files = ["a.tsv", "b.tsv", "c.tsv", "d.tsv", "e.tsv"];

    for (const file of files) {
        const filePath = path.join(__dirname, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.trim().split("\n");

        // Skip header line
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line) continue;

            const parts = line.split("\t");
            if (parts.length < 3) continue;

            const [eco, name, pgn] = parts;
            if (!eco || !name || !pgn) continue;

            const chess = new Chess();
            chess.loadPgn(pgn);

            await db.chess.opening.create({
                data: {
                    eco,
                    name,
                    pgn,
                    fen: chess.fen().split(" ")[0] as string,
                },
            });
        }
    }

    const count = await db.chess.opening.count();
    console.log(`Seeded database with ${count} openings`);
}

main()
    .then(async () => {
        await db.chess.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await db.chess.$disconnect();
        process.exit(1);
    });
