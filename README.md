# PokerSim: A Texas Hold'em Simulator
This is a full stack Texas Hold'em simulator that combines interactive gameplay with real-time probability calculations and expected value analysis. Build using React and Java Spring Boot,
it serves as an educational tool and a quantitative modeling tool.

## Project Goals:
- Build a realistic Texas Hold'em simulator with full game logic and visual interaction
- Integrate backend poker hand evaluation and winner determination
- Provide players with real-time hand odds, win/tie probabilities, and EV calculations
- Enable bots with probabilistic decision-making
- Apply Monte Carlo cimulation for probabilitics forecasting and EV analysis 

## Architecture Overview:
### Frontend(React):
- App.js : main entry point, controls mode, manages card selections and renders UI
- CardSelector.js : interactive card input for hand and board, auto-generates cards and prevents duplicates
- ProbabilityDisplay.js : displays poker hand probabilities, win/tie chances, and expected value
- GameModel.js : UI model to select number of bot opponents before launching the game
- PokerGame.js : core gameplay logic, handles betting rounds, blinds, and turn rotation, manages player banks, pot size, and bot decision-making, sends final hands to backend for winner evaluation

### Backend(Spring Boot):
- PokerController.java : REST API endpoints
    - api/poker/probabilities : returns probabilities and ev
    - /api/poker/evaluate-winner : returns winner index
- PokerHandEvaluator.java : evaluates all 5-card hands and rans them numerically
- PokerEVSimulator.java : runs Monte Carlo Simulations to sample unknown hands for other players and estimate the expected value of calling a bet
- BestFiveCards.java : extracts best 5-card comination from 7 cards
- HandProbabilities.java : computes the chances of completeing hands like pair, flush, straight, etc
- CardParser.java, Card.java, DTOs : utility classes for parsing input, formatting output, and structuring requests

## Educational Use Cases
- Visualize how hand strength and EV evolve across flop, turn, and river
- Teach probability theory and risk/reward analysis using poker
- Run simulated bot vs bot hands for strategy testing

## How to Run 
### Backend
```
cd poker-backend/
./mvnw spring-boot:run
```
The server starts at http://localhost:8080

### Frontend
```
cd poker-ui/
npm install
npm start
```
Opens in browser at http://localhost:3000

## Ideas for Improvement
- Improve bots using betting strategies for more realistic game play
- Export game history for modeling
- Add a dashboard with bankrool graphs and statistics

## Author Notes
Building this project was an opportunity to combine my interests in game thoery, probability, and sotfware engineering into an interactive application. Through developing this
I gained hands-on experience applying quantitative modeling techniques such as Monte Carlo simulation and expected value (EV) analysis. I also learned how to 
bridge frontend and backend systems through RESTful APIs, enabling real-time probability and winner evaluations. I gained experience designing interactive UIs and 
managing complex React state across multiple betting rounds and AI decisions. This project strengthened my skills in probabilistic thinking, data simulation, and decision modeling.



