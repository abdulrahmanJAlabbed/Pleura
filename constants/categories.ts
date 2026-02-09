/**
 * Movie Categories/Genres
 * TMDB Genre IDs - Modern Netflix-style design
 */

export interface Category {
  id: number;
  name: string;
  image: string; // Background image URL
  gradient: [string, string];
}

// Modern, high-quality genre images - using popular movie backdrops
export const CATEGORIES: Category[] = [
  {
    id: 28,
    name: "Action",
    // John Wick style action
    image: "https://image.tmdb.org/t/p/w780/rzdPqYx7Um4FUZeD8wpXqjAUcEm.jpg",
    gradient: ["rgba(229,9,20,0.7)", "rgba(20,20,20,0.95)"],
  },
  {
    id: 12,
    name: "Adventure",
    // Indiana Jones / adventure vibes
    image: "https://image.tmdb.org/t/p/w780/Ai0N1LJcuVfvvHRWqBzrUDlQxaB.jpg",
    gradient: ["rgba(46,204,113,0.7)", "rgba(20,20,20,0.95)"],
  },
  {
    id: 35,
    name: "Comedy",
    // Comedy nightlife feel
    image: "https://image.tmdb.org/t/p/w780/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    gradient: ["rgba(243,156,18,0.7)", "rgba(20,20,20,0.95)"],
  },
  {
    id: 18,
    name: "Drama",
    // Dramatic cinematic
    image: "https://image.tmdb.org/t/p/w780/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    gradient: ["rgba(155,89,182,0.7)", "rgba(20,20,20,0.95)"],
  },
  {
    id: 10749,
    name: "Romance",
    // Romantic atmosphere
    image: "https://image.tmdb.org/t/p/w780/9n2tJBplPbgR2ca05hS5CKxXhL6.jpg",
    gradient: ["rgba(243,104,224,0.7)", "rgba(20,20,20,0.95)"],
  },
  {
    id: 27,
    name: "Horror",
    // Dark horror aesthetic
    image: "https://image.tmdb.org/t/p/w780/5LdGm18yZ8OpBL2G4j6n0iJUECN.jpg",
    gradient: ["rgba(44,62,80,0.7)", "rgba(10,10,15,0.98)"],
  },
  {
    id: 878,
    name: "Sci-Fi",
    // Futuristic sci-fi
    image: "https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    gradient: ["rgba(0,210,211,0.7)", "rgba(20,20,20,0.95)"],
  },
  {
    id: 14,
    name: "Fantasy",
    // Fantasy magical world
    image: "https://image.tmdb.org/t/p/w780/jr0n4ryLsuMveyELe7kcr0gkzxF.jpg",
    gradient: ["rgba(108,92,231,0.7)", "rgba(20,20,20,0.95)"],
  },
  {
    id: 53,
    name: "Thriller",
    // Tense thriller atmosphere
    image: "https://image.tmdb.org/t/p/w780/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    gradient: ["rgba(99,110,114,0.7)", "rgba(10,10,15,0.98)"],
  },
  {
    id: 80,
    name: "Crime",
    // Crime noir aesthetic
    image: "https://image.tmdb.org/t/p/w780/6dEFBpZH8C8OijsynkXvHLwmKBT.jpg",
    gradient: ["rgba(214,48,49,0.7)", "rgba(20,20,20,0.95)"],
  },
  {
    id: 16,
    name: "Animation",
    // Animated movie vibes
    image: "https://image.tmdb.org/t/p/w780/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
    gradient: ["rgba(116,185,255,0.7)", "rgba(20,20,20,0.95)"],
  },
  {
    id: 10751,
    name: "Family",
    // Family-friendly colorful
    image: "https://image.tmdb.org/t/p/w780/pxJbfnMIQQxCrdeLD0zQnWr6ouL.jpg",
    gradient: ["rgba(38,222,129,0.7)", "rgba(20,20,20,0.95)"],
  },
];
