import {Router, type Request, type Response} from 'express';

const exampleRouter = Router();

// Example GET route - Fetch all items
exampleRouter.get('/api/items', (req: Request, res: Response) => {
    res.json({
        success: true,
        items: [
            { id: 1, name: 'Item 1', description: 'First example item' },
            { id: 2, name: 'Item 2', description: 'Second example item' },
        ]
    });
});

// Example GET route with parameter - Fetch single item
exampleRouter.get('/api/items/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const itemId = parseInt(id || '0');
    res.json({
        success: true,
        item: { id: itemId, name: `Item ${id}`, description: `Example item with ID ${id}` }
    });
});

// Example POST route - Create new item
exampleRouter.post('/api/items', (req: Request, res: Response) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json({
            success: false,
            error: 'Name and description are required'
        });
    }

    res.status(201).json({
        success: true,
        item: {
            id: Math.floor(Math.random() * 1000),
            name,
            description,
            createdAt: new Date().toISOString()
        }
    });
});

// Example PUT route - Update item
exampleRouter.put('/api/items/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const itemId = parseInt(id || '0');

    res.json({
        success: true,
        item: {
            id: itemId,
            name: name || `Item ${id}`,
            description: description || 'Updated description',
            updatedAt: new Date().toISOString()
        }
    });
});

// Example DELETE route
exampleRouter.delete('/api/items/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    res.json({
        success: true,
        message: `Item ${id} deleted successfully`
    });
});

export { exampleRouter };

