import { NextResponse } from "next/server";
import { Client } from "ssh2";
import redis from "@/lib/redis";

// Environment variables with fallbacks as per user request
const SSH_HOST = process.env.SSH_HOST || "[IP_ADDRESS]";
const SSH_USER = process.env.SSH_USER || "test";
const SSH_PASSWORD = process.env.SSH_PASSWORD || "password123";
const SSH_PORT = parseInt(process.env.SSH_PORT || "22", 10);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { command = "", teamId, instanceId, skipHistory = false } = body;

    if (!command.trim()) {
      return NextResponse.json({ ok: true, output: "" });
    }

    const parts = command.trim().split(/\s+/).filter(Boolean);
    const cmd = parts[0];
    const args = parts.slice(1);

    // ============= Global Help Check =============
    // We check this first to provide instant help without hitting the server
    if (args.includes("--help") || args.includes("-h")) {
      const ncatHelp = `Ncat 7.98 ( https://nmap.org/ncat )
Usage: ncat [options] [hostname] [port]

Options taking a time assume seconds. Append 'ms' for milliseconds,
's' for seconds, 'm' for minutes, or 'h' for hours (e.g. 500ms).
  -4                         Use IPv4 only
  -6                         Use IPv6 only
  -C, --crlf                 Use CRLF for EOL sequence
  -c, --sh-exec <command>    Executes the given command via /bin/sh
  -e, --exec <command>       Executes the given command
      --lua-exec <filename>  Executes the given Lua script
  -g hop1[,hop2,...]         Loose source routing hop points (8 max)
  -G <n>                     Loose source routing hop pointer (4, 8, 12, ...)
  -m, --max-conns <n>        Maximum <n> simultaneous connections
  -h, --help                 Display this help screen
  -d, --delay <time>         Wait between read/writes
  -o, --output <filename>    Dump session data to a file
  -x, --hex-dump <filename>  Dump session data as hex to a file
  -i, --idle-timeout <time>  Idle read/write timeout
  -p, --source-port port     Specify source port to use
  -s, --source addr          Specify source address to use (doesn't affect -l)
  -l, --listen               Bind and listen for incoming connections
  -k, --keep-open            Accept multiple connections in listen mode
  -n, --nodns                Do not resolve hostnames via DNS
  -t, --telnet               Answer Telnet negotiations
  -u, --udp                  Use UDP instead of default TCP
      --sctp                 Use SCTP instead of default TCP
  -v, --verbose              Set verbosity level (can be used several times)
  -w, --wait <time>          Connect timeout
  -z                         Zero-I/O mode, report connection status only
      --append-output        Append rather than clobber specified output files
      --send-only            Only send data, ignoring received; quit on EOF
      --recv-only            Only receive data, never send anything
      --no-shutdown          Continue half-duplex when receiving EOF on stdin
  -q <time>                  After EOF on stdin, wait <time> then quit.
      --allow                Allow only given hosts to connect to Ncat
      --allowfile            A file of hosts allowed to connect to Ncat
      --deny                 Deny given hosts from connecting to Ncat
      --denyfile             A file of hosts denied from connecting to Ncat
      --broker               Enable Ncat's connection brokering mode
      --chat                 Start a simple Ncat chat server
      --proxy <addr[:port]>  Specify address of host to proxy through
      --proxy-type <type>    Specify proxy type ("http", "socks4", "socks5")
      --proxy-auth <auth>    Authenticate with HTTP or SOCKS proxy server
      --proxy-dns <type>     Specify where to resolve proxy destination
      --ssl                  Connect or listen with SSL
      --ssl-cert             Specify SSL certificate file (PEM) for listening
      --ssl-key              Specify SSL private key (PEM) for listening
      --ssl-verify           Verify trust and domain name of certificates
      --ssl-trustfile        PEM file containing trusted SSL certificates
      --ssl-ciphers          Cipherlist containing SSL ciphers to use
      --ssl-servername       Request distinct server name (SNI)
      --ssl-alpn             ALPN protocol list to use
      --version              Display Ncat's version information and exit

See the ncat(1) manpage for full options, descriptions and usage examples`;

      const HELP_MESSAGES: Record<string, string> = {

        nmap: "Usage: nmap [Scan Type(s)] [Options] {target specification}\nNetwork exploration tool and security / port scanner.",

        nc: ncatHelp,
        ls: "Usage: ls [OPTION]... [FILE]...\nList information about the FILEs.",
        cat: "Usage: cat [OPTION]... [FILE]...\nConcatenate FILE(s) to standard output.",
        pwd: "Usage: pwd\nPrint the name of the current working directory.",
        cd: "Usage: cd <directory>\nChange the shell working directory.",
        whoami: "Usage: whoami\nPrint the current effective user name.",
        help: "Usage: help\nDisplay information about available commands.",
        clear: "Usage: clear\nClears the terminal screen.",
        ping: "Usage: ping [options] <destination>\nSend ICMP ECHO_REQUEST to network hosts.",
        python3: "Usage: python3 [option] ... [-c cmd | -m mod | file | -] [arg] ...\nParse and run Python language scripts."
      };
      
      if (HELP_MESSAGES[cmd]) {
        return NextResponse.json({ ok: true, output: HELP_MESSAGES[cmd] + "\n" });
      }
    }

    // ============= Allowed Commands Check =============
    const ALLOWED_COMMANDS = ['ls', 'cat', 'pwd', 'cd', 'whoami', 'clear', 'ping', 'nc', 'help', 'rickroll', 'python3'];
    
    if (!ALLOWED_COMMANDS.includes(cmd)) {
      return NextResponse.json({ 
        ok: false, 
        output: `Command not allowed: ${cmd}\n` 
      });
    }

    // Special handling for "clear"
    if (cmd === "clear") {
        // Save clear command to history to preserve sequence but visual clear will be handled by frontend
        if (teamId && instanceId) {
            const key = `history:${teamId}:${instanceId}`;
             const historyItem = JSON.stringify({ command: "clear", output: "" });
             await redis.rpush(key, historyItem);
             await redis.ltrim(key, -50, -1);
        }
      return NextResponse.json({ ok: true, output: "", clear: true });
    }

    if (cmd === "help") {
      return NextResponse.json({ 
        ok: true, 
        output: "Allowed commands: " + ALLOWED_COMMANDS.filter(c => c !== 'rickroll').join(", ") + "\n"
      });
    }

    // ============= Virtual File System for IP Fragment Mini-Game =============
    const VIRTUAL_FILES: Record<string, string> = {
      "/home/guest/decode/team_alpha_1.txt": `╔═══════════════════════════════════╗
║   FRAGMENT DELTA-1 RECOVERED      ║
╚═══════════════════════════════════╝

[PARTIAL DATA STREAM DETECTED]

First segment identified:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SEGMENT_1: 123
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: INCOMPLETE
Seek additional fragments...
`,

      "/home/guest/decode/team_alpha_2.txt": `╔═══════════════════════════════════╗
║   FRAGMENT DELTA-2 RECOVERED      ║
╚═══════════════════════════════════╝

[DATA STREAM CONTINUING]

Middle segments extracted:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SEGMENT_2: 45
  SEGMENT_3: 6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: NEARLY COMPLETE
One more fragment remains...
`,

      "/home/guest/decode/team_alpha_3.txt": `╔═══════════════════════════════════╗
║   FRAGMENT DELTA-3 RECOVERED      ║
╚═══════════════════════════════════╝

[FINAL DATA STREAM]

Last segment located:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SEGMENT_4: 7
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╭─────────────────────────────────╮
│  ⚡ DECODE COMPLETE ⚡           │
├─────────────────────────────────┤
│                                 │
│  Four fragments now in hand,    │
│  Join them with dots as planned │
│  The path to power lies within, │
│  Let the Hill conquest begin!   │
│                                 │
│  Hint: XXX.XX.X.X               │
╰─────────────────────────────────╯

Target Node: Awaiting assembly...
`
    };

    const VIRTUAL_DIRECTORIES: Record<string, string[]> = {
      "/home/guest/decode": ["team_alpha_1.txt", "team_alpha_2.txt", "team_alpha_3.txt"]
    };


    // ============= CWD Persistence =============
    const cwdKey = `cwd:${teamId}:${instanceId}`;
    let currentCwd = await redis.get(cwdKey) || "";
    
    // Detect and recover from corrupted CWD state
    // Valid paths should start with '/' or '~', anything else (especially error messages) should be reset
    if (currentCwd && !currentCwd.startsWith('/') && !currentCwd.startsWith('~')) {
        console.log(`Detected corrupted CWD for ${teamId}:${instanceId}: "${currentCwd}". Resetting to empty.`);
        currentCwd = "";
        await redis.del(cwdKey);
    } 

    // ============= Virtual File System Command Handlers =============
    
    // Handle virtual 'cd' command
    if (cmd === "cd") {
      const targetDir = args[0] || "~";
      
      if (targetDir === "/home/guest/decode" || targetDir === "decode") {
        await redis.set(cwdKey, "/home/guest/decode");
        if (teamId && instanceId && !skipHistory) {
          const key = `history:${teamId}:${instanceId}`;
          await redis.rpush(key, JSON.stringify({ command, output: "" }));
          await redis.ltrim(key, -50, -1);
        }
        return NextResponse.json({ ok: true, output: "" });
      } else if (targetDir === "/home/guest") {
        await redis.set(cwdKey, "/home/guest");
        if (teamId && instanceId && !skipHistory) {
          const key = `history:${teamId}:${instanceId}`;
          await redis.rpush(key, JSON.stringify({ command, output: "" }));
          await redis.ltrim(key, -50, -1);
        }
        return NextResponse.json({ ok: true, output: "" });
      } else if (targetDir === ".." && currentCwd === "/home/guest/decode") {
        await redis.set(cwdKey, "/home/guest");
        if (teamId && instanceId && !skipHistory) {
          const key = `history:${teamId}:${instanceId}`;
          await redis.rpush(key, JSON.stringify({ command, output: "" }));
          await redis.ltrim(key, -50, -1);
        }
        return NextResponse.json({ ok: true, output: "" });
      }
    }

    // Handle virtual 'cat' command
    if (cmd === "cat" && args.length > 0) {
      let filePath = args[0];
      if (!filePath.startsWith('/')) {
        if (currentCwd === "/home/guest/decode") {
          filePath = `/home/guest/decode/${filePath}`;
        } else if (currentCwd === "/home/guest") {
          filePath = `/home/guest/${filePath}`;
        }
      }
      
      if (VIRTUAL_FILES[filePath]) {
        const output = VIRTUAL_FILES[filePath];
        if (teamId && instanceId && !skipHistory) {
          const key = `history:${teamId}:${instanceId}`;
          await redis.rpush(key, JSON.stringify({ command, output }));
          await redis.ltrim(key, -50, -1);
        }
        return NextResponse.json({ ok: true, output });
      }
    }

    // Handle virtual 'ls' command
    if (cmd === "ls") {

      let targetPath = args[0] || currentCwd || "/home/guest";
      if (targetPath === "decode" && currentCwd === "/home/guest") {
        targetPath = "/home/guest/decode";
      }
      
      if (VIRTUAL_DIRECTORIES[targetPath]) {
        const output = VIRTUAL_DIRECTORIES[targetPath].join("\n") + "\n";
        if (teamId && instanceId && !skipHistory) {
          const key = `history:${teamId}:${instanceId}`;
          await redis.rpush(key, JSON.stringify({ command, output }));
          await redis.ltrim(key, -50, -1);
        }
        return NextResponse.json({ ok: true, output });
      }
    }

    // Handle virtual 'pwd' command
    if (cmd === "pwd" && currentCwd && currentCwd.startsWith("/home/guest")) {
      const output = currentCwd + "\n";
      if (teamId && instanceId && !skipHistory) {
        const key = `history:${teamId}:${instanceId}`;
        await redis.rpush(key, JSON.stringify({ command, output }));
        await redis.ltrim(key, -50, -1);
      }
      return NextResponse.json({ ok: true, output });
    }

    // ============= SSH Execution =============
    let finalCommand = command;
    let executeCommandStr = "";



    // Safety: Auto-limit ping if no count specified to prevent hanging
    if (cmd === "ping") {
        if (args[0] === "157.245.108.109") {
             return NextResponse.json({
                ok: true,
                interactive: true,
                prompt: "SAY MY NAME : ",
                type: "breaking_bad"
             });
        }
        if (args[0] === "cookcrackcapture.in") {
            // Secret rickroll trigger
            finalCommand = "curl -m 10 -s -L http://ASCII.live/can-you-hear-me";
        } else if (!args.includes("-c")) {
            finalCommand = `${command} -c 4`;
        }
    }

    // Safety: Auto-limit nc with a timeout to prevent hanging connections
    if (cmd === "nc" && !args.includes("-w") && !args.includes("--wait")) {
      finalCommand = `${cmd} -w 5 ${args.join(" ")}`;
    }

    // easter egg: rickroll
    if (cmd === "rickroll") {
        // -m 10: max time 10 seconds to prevent infinite stream hanging the connection
        // -s: silent mode (don't show progress meter)
        // -L: follow redirects
        finalCommand = "curl -m 10 -s -L http://ASCII.live/can-you-hear-me";
    }

    if (cmd === "cd") {
        const targetDir = args[0] || "~"; // Default to home if no arg
        const baseCmd = currentCwd ? `cd "${currentCwd}" &&` : "";
        // Try to change dir and print new path. If fails, prints error to stderr.
        executeCommandStr = `${baseCmd} cd "${targetDir}" && pwd`;
    } else {
        const baseCmd = currentCwd ? `cd "${currentCwd}" &&` : "";
        executeCommandStr = `${baseCmd} ${finalCommand}`;
    }

    // For cd to work in a persistent way, we would need to track state, but for this snippet
    // we execute it directly. It won't persist across requests in standard ssh exec cleanly
    // without chaining, but we follow the requested logic.
    
    let output = await executeRemoteCommand(executeCommandStr);

    // If it was a CD command, check if we got a valid path back (success)
    if (cmd === "cd") {
        const trimmedOutput = output.trim();
        
        // Strict validation: a successful pwd output should start with '/'
        // If it doesn't, it's likely an error message, so don't update CWD
        if (trimmedOutput.startsWith('/')) {
            // Valid path, update CWD
            await redis.set(cwdKey, trimmedOutput);
            output = ""; // CD should be silent on success
        } else {
            // Either an error or invalid output - don't update CWD, show the error
            // If it looks like an error message, clean it up a bit
            if (trimmedOutput.includes("No such file") || trimmedOutput.includes("not a directory")) {
                output = `cd: ${args[0]}: No such file or directory\n`;
            } else if (trimmedOutput.includes("Permission denied")) {
                output = `cd: ${args[0]}: Permission denied\n`;
            }
            // Otherwise keep the raw error output
        }
    }

    // Save history for valid execution
    if (teamId && instanceId && cmd !== "clear" && !skipHistory) {
       const key = `history:${teamId}:${instanceId}`;
       // For CD, we save the command 'cd ...' but output is empty.
       const historyItem = JSON.stringify({ command, output });
       await redis.rpush(key, historyItem);
       await redis.ltrim(key, -50, -1); // Keep last 50 commands
    }
    
    return NextResponse.json({ ok: true, output });

  } catch (error: any) {
    console.error("SSH Error:", error);
    return NextResponse.json({ 
      ok: false, 
      output: `Error executing command: ${error.message}\n` 
    });
  }
}

function executeRemoteCommand(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let outputData = "";
    let errorData = "";

    conn.on("ready", () => {
      conn.exec(command, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }

        stream.on("close", (code: number, signal: any) => {
          conn.end();
          if (code !== 0 && errorData) {
            // If there's a non-zero exit code and stderr content, prefer stderr
            resolve(errorData || outputData); 
          } else {
             // Otherwise return standard output (or stderr if stdout is empty)
             resolve(outputData + errorData);
          }
        }).on("data", (data: any) => {
          outputData += data;
        }).stderr.on("data", (data: any) => {
          errorData += data;
        });
      });
    }).on("error", (err) => {
      reject(new Error(`Connection failed: ${err.message}`));
    }).connect({
      host: SSH_HOST,
      port: SSH_PORT,
      username: SSH_USER,
      password: SSH_PASSWORD,
      // readyTimeout: 5000, // Optional: adjust timeout
    });
  });
}
