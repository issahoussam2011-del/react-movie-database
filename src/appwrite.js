import { Client, TablesDB, Query, ID } from 'appwrite';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
const database = new TablesDB(client);

export const updateSearchCount = async (movie) => {
  try {
    const sessionKey = `searched_movie_${movie.id}`;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    const result = await database.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.equal('movie_id', Number(movie.id))],
    });

    if (result.rows.length > 0) {
      const doc = result.rows[0];
      await database.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: doc.$id,
        data: { count: doc.count + 1 },
      });
    } else {
      await database.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: ID.unique(),
        data: {
          movieName: movie.title,
          count: 1,
          movie_id: Number(movie.id),
          poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
        },
      });
    }

    sessionStorage.setItem(sessionKey, 'true');
  } catch (err) {
    console.error(err);
  }
};

export const getTrendingMovies = async () => {
  try {
    const result = await database.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [Query.limit(5), Query.orderDesc('count')],
    });
    return result.rows;
  } catch (err) {
    console.error(err);
  }
};
