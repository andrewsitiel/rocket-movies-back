const knex = require("../database/knex/index");
class MoviesController {

  async index (request, response) {
    const { user_id, title, tags } = request.query;

    let allUserMovies
    
    if(tags && title) 
      {
        const movieTags = tags.split(",").map( tag => tag.trim() );
        
        allUserMovies = await knex("movie_tags")

        .innerJoin("movies","movies.id", "movie_tags.movie_id")
        
        .select("movies.id", "movies.title", "movies.description", "movies.rating")
        
        .where("movies.user_id", user_id )
        
        .whereLike("movies.title", `%${title}%`)

        .whereIn("name", movieTags)
        
        .orderBy("created_at");

        const moviesTags = await knex("movie_tags")
        .where({user_id})
        .orderBy("name");

        const allUserMoviesWithTags = allUserMovies.map(
          movie => {
            const movieTags = moviesTags.filter(tag => tag.movie_id === movie.id);
            return {
              ...movie,
              tags: movieTags.map(tag => tag.name)
            };
          });

        return response.status(200).json(allUserMoviesWithTags);
      }

    if(tags) 
      {
        const movieTags = tags.split(",").map( tag => tag.trim() );
        
        allUserMovies = await knex("movie_tags")

        .innerJoin("movies","movies.id", "movie_tags.movie_id")
        
        .select("movies.id", "movies.title", "movies.description", "movies.rating")
        
        .where("movies.user_id", user_id )
        
        .whereIn("name", movieTags)
        
        .orderBy("created_at");

        const moviesTags = await knex("movie_tags")
        .where({user_id})
        .orderBy("name");

        const allUserMoviesWithTags = allUserMovies.map(
          movie => {
            console.log(movie)
            const movieTags = moviesTags.filter(tag => tag.movie_id === movie.id);
            return {
              ...movie,
              tags: movieTags.map(tag => tag.name)
            }
          });
        return response.status(200).json(allUserMoviesWithTags);
      }

    if(title) 
    {
      allUserMovies = await knex("movie_tags")

      .innerJoin("movies","movies.id", "movie_tags.movie_id")
      
      .select("movies.id", "movies.title", "movies.description", "movies.rating")
      
      .where("movies.user_id", user_id )
      
      .whereLike("movies.title", `%${title}%`)
      
      .orderBy("created_at");

      return response.status(200).json(allUserMovies);
    }

    allUserMovies = await knex("movies")
    .select("id", "title", "description", "rating")
    .orderBy("created_at");

    return response.status(200).json(allUserMovies);
  };

  async create (request, response) {

    const { title, description, rating, user_id, tags } = request.body;

    const invalidRate = Number(rating) > 5 || Number(rating) < 0;

    if (invalidRate)
    { return response.status(200).json("Digite uma nota válida") };
    
    const movie_id = await knex("movies").insert( {title, description, rating, user_id} );

    const movie = await knex("movies")
    .where({id: movie_id})
    .first("title", "description", "rating", "cover", "created_at");

    if(tags)
      { 
        const movieTags = tags.map(
          tag => {
            return {
              name: tag,
              movie_id,
              user_id
            }
        })

        await knex("movie_tags").insert(movieTags);
      }
    
    return response.status(200).json(movie);
  };

  async show (request, response) {
    const { id } = request.params;

    const movie = await knex("movies")
    .where({ id })
    .first("title", "description", "rating", "created_at", "updated_at");

    const movieTags = await knex("movie_tags")
    .where({ movie_id: id })
    .select("name")
    .orderBy("name");

    const movieWithTags = {
      ...movie,
      tags: movieTags.map( tagName => tagName.name)
    };

    return response.status(200).json(movieWithTags);
  };

  async update (request, response) {
    const { movie_id } = request.params;

    const { title, description, rating, cover, tags } = request.body;

    const invalidRate = Number(rating) > 5 || Number(rating) < 0;
    
    if (invalidRate)
    { return response.status(200).json("Digite uma nota válida") };

    await knex("movies")
    .where({id: movie_id})
    .update({title, description, rating, cover});

    const movie = await knex("movies")
    .where({id: movie_id})
    .first("title", "description", "rating", "cover", "created_at", "updated_at");

    
    if (tags)
      {
        const newTags = tags.split(",").map(tag => tag.trim());

        const allMovieTags = await knex("movie_tags")
        .where({movie_id});
        
        const allTagNames = allMovieTags.map(tag => tag.name);

        const filteredTags = newTags.filter( tag => !(allTagNames.includes(tag)) );

        const movieForeignKey = await knex("movies")
        .where({id: movie_id})
        .first("user_id")
        
        const filteredTagsWithIDs = filteredTags.map(
          tag => {
            return { 
              name: tag, 
              movie_id, 
              user_id: movieForeignKey.user_id}
          })
        
          if( filteredTags.length > 0)
          { await knex("movie_tags").insert(filteredTagsWithIDs) }
          
          const moviesWithTags = {
            ...movie,
            tags: filteredTags
           };

          return response.status(200).json(moviesWithTags);
      } 

      return response.status(200).json(movie);
  };

  async delete (request, response) {
    const { movie_id } = request.params;

    await knex("movies").where({id: movie_id}).delete();

    return response.status(200).json("Filme deletado.");
  };
}

module.exports = MoviesController;