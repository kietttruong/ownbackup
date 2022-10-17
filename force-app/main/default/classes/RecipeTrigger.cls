public with sharing class RecipeTrigger {
    public RecipeTrigger() {

    }

    // Method to handle business logic on after update
    public static void handleAfterUpdate(List<Recipe__c> recipeList) {
        handleSubscriberUpdate(recipeList);
    }

    // Method to notify users that a recipe they are subscribed to
    // is updated. 
    public static void handleSubscriberUpdate(List<Recipe__c> recipeList) {

        // Do a describe to get the Reaction's available
        // Record types. 
        Schema.DescribeSObjectResult reactionDescribe = Schema.SObjectType.Reaction__c;
        Map<String, Schema.RecordTypeInfo> reactionRTMapping = reactionDescribe.getRecordTypeInfosByDeveloperName();
        Schema.RecordTypeInfo subRT = reactionRTMapping.get('Subscribe');

        List<Id> usersToUpdate = new List<Id>();

        // Query for the reactions that are related to the
        // recipe that was updated and is also a subscribe
        List<Reaction__c> subscribersToUpdate = [SELECT Id, User__c, Recipe__c, RecordTypeId
                                                    FROM Reaction__c
                                                    WHERE recipe__c in: recipeList
                                                    AND RecordTypeId =: subRT.getRecordTypeId()];

        // Aggregate the users for each subscription
        for (Reaction__c sub : subscribersToUpdate) {
            usersToUpdate.add(sub.User__c);
        }

        // Notify the users
        sendUserSubNotificationEmail(usersToUpdate);
    }

    // Send the email out to the users. 
    public static void sendUserSubNotificationEmail(List<Id> usersToNotify) {
        Messaging.reserveMassEmailCapacity(usersToNotify.size());
        
        List<Messaging.SingleEmailMessage> emailMessagesToSend = new List<Messaging.SingleEmailMessage>();

        for(Id userId : usersToNotify) {
            Messaging.SingleEmailMessage emailMessage = new Messaging.SingleEmailMessage();

            emailMessage.setSubject('A recipe you subscribe to has been updated!');
            emailMessage.setHtmlBody('A recipe you subscribe to has been updated!');
            emailMessage.setTargetObjectId(userId);
            emailMessage.setSaveAsActivity(false);
            
            emailMessagesToSend.add(emailMessage);
        }
        
        Messaging.sendEmail(emailMessagesToSend);

        System.debug(loggingLevel.ERROR, 'sent email' + emailMessagesToSend);
    }
}
