declare module "@salesforce/apex/RecipeController.getRecipes" {
  export default function getRecipes(): Promise<any>;
}
declare module "@salesforce/apex/RecipeController.getReactions" {
  export default function getReactions(param: {recipeId: any}): Promise<any>;
}
declare module "@salesforce/apex/RecipeController.createContentDocLink" {
  export default function createContentDocLink(param: {fileId: any, recipeId: any}): Promise<any>;
}
declare module "@salesforce/apex/RecipeController.createReactionRecord" {
  export default function createReactionRecord(param: {reactionRecordType: any, recipeId: any, userId: any}): Promise<any>;
}
declare module "@salesforce/apex/RecipeController.removeReactionRecords" {
  export default function removeReactionRecords(param: {reactionRecordType: any, recipeId: any, userId: any}): Promise<any>;
}
