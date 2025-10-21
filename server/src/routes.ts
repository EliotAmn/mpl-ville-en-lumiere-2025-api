import {Router, type Request, type Response} from 'express';
import cvl from "./websocket.js";

const router = Router();

router.get('/api/results', (req: Request, res: Response) => {
    res.json({
        left: cvl.getVotes().left,
        right: cvl.getVotes().right,
        team1_players: cvl.getTeam1Players(),
        team2_players: cvl.getTeam2Players(),
    });
});

router.post('/api/start-vote', (req: Request, res: Response) => {
    cvl.openVotes()
});

router.post('/api/stop-vote', (req: Request, res: Response) => {
    cvl.closeVotes()
});

export default router;
