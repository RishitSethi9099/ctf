# King of the Hill (KOTH) CTF Setup

This CTF platform now includes a **King of the Hill** competition mode where teams compete in real-time to gain and maintain admin access on a vulnerable machine.

## 🏰 KOTH Features

### Core Gameplay
- **Real-time Competition**: Multiple teams attack the same vulnerable machine simultaneously
- **Admin Control**: Only one team can be admin at a time - others must steal it
- **Web Shell Interface**: Full terminal access through the browser using xterm.js
- **Docker Isolation**: Each team gets their own containerized vulnerable environment
- **Live Leaderboard**: Track admin time and see who's currently in control
- **Defense Mechanisms**: Teams can add layers of protection to maintain admin access

### Competition Elements
- **Privilege Escalation**: Find vulnerabilities to gain root access
- **System Hardening**: Patch vulnerabilities and add defenses
- **Monitoring**: Detect when other teams are attacking
- **Persistence**: Maintain access even when other teams try to kick you out

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Docker (for full functionality)
- Git

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Build the Vulnerable Docker Image** (Optional - for full Docker support)
```bash
docker build -t koth-vulnerable-machine -f Dockerfile.koth .
```

3. **Start the Development Environment**
```bash
# Run both frontend and KOTH server
npm run dev-koth

# Or run separately
npm run dev          # Frontend only
npm run koth-server  # Backend only
```

### Configuration

The KOTH server runs on port 8080 by default. If you need to change this:

1. Edit `koth-server.js` and change the port in the `start()` method
2. Update the WebSocket connection URL in `app/components/KOTHShell.tsx`

## 🎮 How to Play

### Getting Started
1. Navigate to the CTF main page
2. Click on the **"King of the Hill 🏰"** domain
3. You'll be connected to a vulnerable machine via web shell

### Basic Commands to Try
```bash
# Basic reconnaissance
whoami
ls -la
ps aux
netstat -tulpn

# Look for vulnerabilities
find / -perm -4000 2>/dev/null          # SUID binaries
cat /etc/passwd                         # User accounts
sudo -l                                 # Sudo permissions
crontab -l                              # Cron jobs

# Try privilege escalation
sudo privilege_escalation_exploit       # Simulation mode
```

### Winning Strategies

#### 1. Initial Access
- Enumerate the system thoroughly
- Look for weak file permissions
- Check for vulnerable services
- Find default passwords

#### 2. Gaining Admin
- Exploit SUID binaries
- Use SQL injection on web services
- Buffer overflow attacks
- Privilege escalation exploits

#### 3. Maintaining Control
- Change passwords immediately
- Patch vulnerabilities you used
- Set up monitoring scripts
- Create backdoors (carefully!)
- Block other teams' access methods

#### 4. Advanced Defense
- Monitor login attempts
- Set up intrusion detection
- Modify system files to break exploits
- Create honeypots to detect attackers

## 🏆 Scoring System

### Points Calculation
- **Admin Time**: Points awarded based on how long you maintain admin access
- **First Blood**: Bonus points for first team to gain admin
- **Defensive Actions**: Points for successfully blocking other teams
- **Persistence**: Bonus points for regaining admin access quickly after losing it

### Leaderboard Metrics
- **Current Admin**: Who currently controls the machine
- **Total Admin Time**: Cumulative time each team held admin access
- **Admin Changes**: How many times control switched hands
- **Last Seen**: When each team was last active

## 🛡️ Security Features

### Isolation
- Each team gets their own Docker container
- Network isolation prevents direct team-to-team attacks
- Resource limits prevent DoS attacks

### Monitoring
- All commands are logged
- Real-time admin status tracking
- Team activity monitoring
- Automated cleanup of containers

### Fair Play
- Automatic admin loss simulation (other teams attacking)
- Time limits on admin control
- Equal starting conditions for all teams

## 🔧 Customization

### Adding New Vulnerabilities

Edit `Dockerfile.koth` to add new vulnerable services:

```dockerfile
# Add a new vulnerable service
RUN echo "your_vulnerable_service_here" > /etc/vulnerable_service.conf
```

### Modifying Simulation Mode

When Docker is not available, the system runs in simulation mode. Customize the simulated responses in `koth-server.js`:

```javascript
// Add new simulated commands
if (command.includes('your_command')) {
  response = 'your_custom_response';
}
```

### Adjusting Game Balance

Modify timing and difficulty in `koth-server.js`:

```javascript
// Change admin loss probability
if (client && Math.random() < 0.3) { // 30% chance

// Change time between admin challenges
setTimeout(() => { ... }, 30000 + Math.random() * 60000); // 30-90 seconds
```

## 🐛 Troubleshooting

### Docker Issues
If Docker is not available, the system automatically falls back to simulation mode. You'll see:
```
SIMULATION MODE
Docker not available. Simulating vulnerable machine...
```

### Connection Problems
- Check that the KOTH server is running on port 8080
- Verify WebSocket connections aren't blocked by firewall
- Ensure CORS is properly configured

### Performance Issues
- Limit the number of concurrent connections
- Reduce Docker container resource limits
- Optimize terminal update frequency

## 🎯 Advanced Features

### Team Collaboration
Teams can work together by sharing the same `teamId`, allowing multiple members to access the same container.

### Custom Scenarios
Create different vulnerable machine images for various skill levels:
- **Beginner**: Basic privilege escalation
- **Intermediate**: Web application vulnerabilities
- **Advanced**: Complex exploitation chains

### Tournament Mode
Run multiple KOTH instances simultaneously for large competitions:
```bash
# Start multiple servers on different ports
PORT=8080 npm run koth-server &
PORT=8081 npm run koth-server &
PORT=8082 npm run koth-server &
```

## 📝 Development Notes

### Architecture
- **Frontend**: Next.js with xterm.js for terminal emulation
- **Backend**: Socket.io server for real-time communication
- **Containerization**: Docker for isolated vulnerable environments
- **State Management**: In-memory storage (consider Redis for production)

### Future Enhancements
- [ ] Persistent storage for longer competitions
- [ ] Team authentication system
- [ ] Advanced logging and analytics
- [ ] Multiple machine types
- [ ] Automated vulnerability scanning
- [ ] Integration with existing CTF platforms

---

## 🏅 Competition Tips

### For Teams
1. **Work Together**: Coordinate attacks and defenses
2. **Document Everything**: Keep track of what works
3. **Think Defensively**: Don't just attack - defend too
4. **Monitor Constantly**: Watch for other teams' activities
5. **Be Creative**: Use unconventional methods

### For Organizers
1. **Set Clear Rules**: Define what's allowed
2. **Monitor Closely**: Watch for cheating or issues
3. **Provide Hints**: Help stuck teams with targeted hints
4. **Balance Difficulty**: Ensure challenges are fair
5. **Have Backups**: Prepare for technical issues

Ready to battle for the crown? 👑 Good luck in the arena!