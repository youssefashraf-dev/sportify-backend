
## Reviews
- you can only add review on past bookings 
- when you add a review the court stars changes

### Endpoints
- `GET /api/reviews` - Get all reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## Matches
- you can create match only on confirmed upcoming bookings
- you have two ways to get matches :
1- Home Page button = show available matches to join // you only can request to join matches
2- navbar button show your own matches which you created // you can accept/refuse players
- once you accept from waiting list the player added to players tap
- once you refuse from waiting list the player removed from saiting list tap

### Endpoints
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get match details
- `POST /api/matches` - Create match
- `PUT /api/matches/:id` - Update match
- `DELETE /api/matches/:id` - Delete match

- `POST /api/matches/:id/apply` - Request to join a match
- `POST /api/matches/:matchId/applications/:userId/accept` - Accept applied user
- `POST /api/matches/:matchId/applications/:userId/reject` - Refuse applied user
- `POST /api/matches//:id/cancel` - Cancel Match