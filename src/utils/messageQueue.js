const amqplib = require('amqplib');
const {MESSAGE_BROKER_URL,EXCHANGE_NAME} = require('../config/serverConfig');
const createChannel = async()=>{
    try {
          const connection  = await amqplib.connect(MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    // once channel is setup message broker helps us to distribute message in diff queues
    await channel.assertExchange(EXCHANGE_NAME,'direct',false);
    return channel;
    } catch (error) {
        throw error;
    }
}
const subscribeMessage = async (channel,service,binding_key)=>{
   try {
     const applicationQueue = await channel.assertQueue('REMINDER_QUEUE');
    channel.bindQueue(applicationQueue.queue,EXCHANGE_NAME,binding_key);
    channel.consume(applicationQueue.queue,msg=>{
        console.log("Received data");
        console.log(msg.content.toString());
        channel.ack(msg);
    });
   } catch (error) {
throw error;
   }
}
const publishMessage = async(channel,binding_key,message)=>{
    try {
        const applicationQueue = await channel.assertQueue('REMINDER_QUEUE');
    channel.bindQueue(applicationQueue.queue,EXCHANGE_NAME,binding_key);
        await channel.publish(EXCHANGE_NAME,binding_key,Buffer.from(message));
    } catch (error) {
        throw error
    }
}
module.exports={
    subscribeMessage,
    createChannel,
    publishMessage
}