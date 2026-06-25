import { Connection } from "mongoose";

/*
The declare keyword is like telling TypeScript: 
	"Trust me, this variable exists somewhere else at runtime. You don't need to create it; just know it has this specific type".

	declare global "breaks out" of the file's private scope to tell TypeScript: "Hey, I’m adding a custom property called mongodbConnection to the global execution environment
*/
declare global {
	var mongodbConnection: {
		conn: Connection | null,
		promise: Promise<Connection> | null

	}

	interface Window {
		EyeDropper?: new () => {
			open: () => Promise<{ sRGBHex: string }>;
		};
	}
}

