/**
 *  Define a set of template paths to pre-load
 *  Pre-loaded templates are compiled and cached for fast access when rendering
 *  
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
    console.log("tfhogwarts | Preloading sheet partials");

    // Define template paths to load
    const templatePaths = [
        // Actor Sheet Partials
        "systems/tfhogwarts/templates/actors/parts/conditions.hbs",
        "systems/tfhogwarts/templates/actors/parts/relationships.hbs",
        "systems/tfhogwarts/templates/actors/parts/relationships-teen.hbs",
        "systems/tfhogwarts/templates/actors/parts/item-hideout.hbs",
        "systems/tfhogwarts/templates/actors/parts/core-info.hbs",
        "systems/tfhogwarts/templates/actors/parts/core-teen.hbs",
        "systems/tfhogwarts/templates/actors/parts/conditions-teen.hbs",
        "systems/tfhogwarts/templates/actors/parts/teen-item-notes.hbs"
    ];
  
    // Load the template parts
    return loadTemplates(templatePaths);
};
