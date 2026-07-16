export interface SquadPlayer {
    id: number;

    jersey_number: number | null;

    age: number | null;

    appearances: number;
    goals: number;
    assists: number;

    minutes_played: number;

    rating: number | null;

    yellow_cards: number;
    red_cards: number;

    player: {
        id: number;
        name: string;
        image_path: string | null;
    };

    position: {
        id: number;
        name: string;
    };

    detailed_position: {
        id: number;
        name: string;
    };

    team: {
        id: number;
        name: string;
        image_path: string | null;
    };

    season: {
        id: number;
        name: string;
        finished: boolean;
        starting_at: string;
        ending_at: string;
    };

    country: {
        id: number;
        name: string;
        image_path: string;
    };
}