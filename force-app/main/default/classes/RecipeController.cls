public with sharing class RecipeController {
    public RecipeController() {

    }

    class RecipeWrapper {
        @AuraEnabled
        public String name;
        @AuraEnabled
        public String description;
        @AuraEnabled
        public String photourl;
        @AuraEnabled
        public String id;

        public recipeWrapper(String id, String name, String description, String contentVersionId) {
            this.name = name;
            this.description = description;
            this.id = id;
            
            if (contentVersionId != '' && contentVersionId != null) {
                this.photoURL = URL.getSalesforceBaseUrl().toExternalForm() + 
                                '/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=' + contentVersionId;
            } else {
                this.photourl = URL.getSalesforceBaseUrl().toExternalForm()+''+PageReference.forResource('DefaultImage').getUrl();
            }
        }
    }

    @AuraEnabled(cacheable=true scope='global')
    public static List<RecipeWrapper> getRecipes() {
        try {
            Map<Id, Id> recipeIdToContentVersionId = new Map<Id, Id>();
            Map<Id, Id> contentDocToRecipeMap = new Map<Id, Id>();
            List<RecipeWrapper> recipeWrappedList = new List<RecipeWrapper>();
            Map<Id, Recipe__c> recipeMap = new Map<Id, Recipe__c>([SELECT Id, Name, Description__c
                                            FROM Recipe__c
                                            ORDER BY Name
                                            Limit 50]);

            // Query for the junction object
            // That links the recipe and the photo attachment in content doc
            List<ContentDocumentLink> CDLList = [SELECT ContentDocumentId, LinkedEntityId 
                                                    FROM ContentDocumentLink
                                                    WHERE LinkedEntityId in: recipeMap.keySet()];

            
            // Go through and create a mapping of 
            // content doc to the recipe ID 
            // This is used for querying and for being able to 
            // get the associated content version to recipe later
            for (ContentDocumentLink link : CDLList) {
                contentDocToRecipeMap.put(link.ContentDocumentId, link.LinkedEntityId);
            }

            // Query for the content version, this is used in the wrapper
            List<ContentVersion> contentVersionList = [SELECT Id, contentDocumentId 
                                                        FROM ContentVersion
                                                        WHERE contentDocumentId in: contentDocToRecipeMap.keyset()
                                                        AND IsLatest = true];

            for (ContentVersion contVersion : contentVersionList) {
                System.debug('contversion is: ' + contVersion);
                Id recipeId = contentDocToRecipeMap.get(contVersion.ContentDocumentId);
                System.debug('recipeId is: ' + recipeId);
                // Map the recipe ID to the content version Id
                recipeIdToContentVersionId.put(recipeId, contVersion.Id);
            }

            System.debug('recipe id to contnt version id: ' + recipeIdToContentVersionId);
            for (Recipe__c recipe : recipeMap.values()) {
                System.debug(LoggingLevel.ERROR, 'pulled id: ' + recipeIdToContentVersionId.get(recipe.Id));
                // Create the new recipe wrapper
                RecipeWrapper recipeWrapper = new RecipeWrapper(recipe.id, recipe.Name, recipe.Description__c, recipeIdToContentVersionId.get(recipe.Id));

                recipeWrappedList.add(recipeWrapper);
                System.debug('recipeWrapper: ' + recipeWrapper);
            }


            return recipeWrappedList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Reaction__c> getReactions(Id recipeId) {
        try {
            return [SELECT Id, User__c, User__r.Name, User__r.FullPhotoUrl 
                    FROM Reaction__c
                    Where Recipe__c =: recipeId
                    AND RecordType.Name = 'Like'];
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void createContentDocLink(String fileId, String recipeId) {
        try {
            ContentDocumentLink docLink = new ContentDocumentLink();
            
            docLink.ContentDocumentId = fileId;
            docLink.LinkedEntityId = recipeId;

            insert docLink;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Boolean createReactionRecord(String reactionRecordType, String recipeId, String userId){
        try {
            Boolean canCreateReaction = true;
            
            // Verify if there is already a record of the record that is about to be created
            List<Reaction__c> reactionList = queryForReactions(reactionRecordType, recipeId, userId);


            if (reactionList.size() != 0) {
                canCreateReaction = false;
            } else {
                Schema.RecordTypeInfo reactionRT = getReactionRT(reactionRecordType);
                Reaction__c newReaction = new Reaction__c();

                newReaction.Recipe__c = recipeId;
                newReaction.User__c = userId;
                newReaction.RecordTypeId = reactionRT.getRecordTypeId();
                
                insert newReaction;

                canCreateReaction = true;

            }
            
            return canCreateReaction;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Boolean removeReactionRecords(String reactionRecordType, String recipeId, String userId){
        try {
            Boolean canRemoveReaction = true;
            
            // Verify if there is already a record of the record that is about to be created
            List<Reaction__c> reactionList = queryForReactions(reactionRecordType, recipeId, userId);

            if (reactionList.size() != 0) {
                delete reactionList; 
                
                canRemoveReaction = true;
            } else {
                canRemoveReaction = false;
            }
            
            return canRemoveReaction;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public static List<Reaction__c> queryForReactions(String reactionRecordType, String recipeId, String userId) {
        Schema.RecordTypeInfo reactionRT = getReactionRT(reactionRecordType);
        
        // Verify if there is already a record of the record that is about to be created
        List<Reaction__c> reactionList = [SELECT Id, RecordTypeId, RecordType.Name, User__c, Recipe__c
                                            FROM Reaction__c
                                            WHERE RecordTypeId =: reactionRT.getRecordTypeId()
                                            AND Recipe__c =: recipeId
                                            AND User__c =: userId];

        return reactionList;
    }

    public static Schema.RecordTypeInfo getReactionRT(String reactionRecordType) {
        Schema.DescribeSObjectResult reactionDescribe = Schema.SObjectType.Reaction__c;
        Map<String, Schema.RecordTypeInfo> reactionRTMapping = reactionDescribe.getRecordTypeInfosByDeveloperName();
        Schema.RecordTypeInfo reactionRT = reactionRTMapping.get(reactionRecordType);

        return reactionRt;
    }
}
