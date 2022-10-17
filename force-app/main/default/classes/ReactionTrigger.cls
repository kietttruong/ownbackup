public with sharing class ReactionTrigger {
    public ReactionTrigger() {

    }

    // Method to handle business logic on after insert
    public static void handleAfterCreate(List<Reaction__c> reactionList) {
        handleReactionCreation(reactionList);

    }

    // Method to handle reaction creation
    public static void handleReactionCreation(List<Reaction__c> reactionList) {

        // Do a describe to get the Reaction's available
        // Record types. 
        Schema.DescribeSObjectResult reactionDescribe = Schema.SObjectType.Reaction__c;
        Map<String, Schema.RecordTypeInfo> reactionRTMapping = reactionDescribe.getRecordTypeInfosByDeveloperName();
        Schema.RecordTypeInfo likeRT = reactionRTMapping.get('Like');
        List<Id> userIdsToNotify = new List<Id>();
        List<Id> likeReactionRecipeIdList = new List<Id>();

        // Filter the list of reactions for the likes
        // Keep track of those recipes to query after. 
        for (Reaction__c reaction : reactionList) {
            if (reaction.recordTypeId == likeRT.getRecordTypeId()) {
                likeReactionRecipeIdList.add(reaction.Recipe__c);
            }
        }

        List<Recipe__c> likedRecipeList = [SELECT Id, OwnerId 
                                            FROM Recipe__c
                                            Where Id in: likeReactionRecipeIdList];
        
        // Go through the list of recipes 
        // and aggregate the Owner Ids to notify

        for (Recipe__c recipe : likedRecipeList) {
            userIdsToNotify.add(recipe.OwnerId);
        }



        // Send the email notification. 
        sendUserLikeNotificationEmail(userIdsToNotify);
    }

    // Given the list of users
    // Create an email message per user and send it. 
    public static void sendUserLikeNotificationEmail(List<Id> usersToNotify) {
        Messaging.reserveMassEmailCapacity(usersToNotify.size());
        
        List<Messaging.SingleEmailMessage> emailMessagesToSend = new List<Messaging.SingleEmailMessage>();

        for(Id userId : usersToNotify) {
            Messaging.SingleEmailMessage emailMessage = new Messaging.SingleEmailMessage();

            emailMessage.setSubject('Someone liked your recipe!');
            emailMessage.setHtmlBody('A new person liked your recipe!');
            emailMessage.setTargetObjectId(userId);
            emailMessage.setSaveAsActivity(false);
            
            emailMessagesToSend.add(emailMessage);
        }
        
        Messaging.sendEmail(emailMessagesToSend);

        System.debug(loggingLevel.ERROR, 'sent email' + emailMessagesToSend);
    }


}
