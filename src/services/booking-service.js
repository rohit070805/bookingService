const { default: axios } = require('axios');
const {BookingRepository} = require('../repository/index');
const {FLIGHT_SERVICE_PATH} =require('../config/serverConfig');
const {publishMessage} = require('../utils/messageQueue');
const {REMINDER_BINDING_KEY} = require('../config/serverConfig');
const { ServiceError } = require('../utils/errors');
const services = require('.');
class BookingService{
    constructor(){
        this.bookingRepository= new BookingRepository();
    }
    async createBooking(data,channel){
        try {
            const flightId = data.flightId;
            let getflightrequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            const response =await axios.get(getflightrequestURL);
            const flightData = response.data.data;
           
            if(data.noOfSeats > flightData.totalSeats){
                 throw new ServiceError(
                    'Something went wrong in booking process',
                    'Insufficient Seats',
                 );  
            }

            const priceOfFlight = flightData.price;
            const totalCost = priceOfFlight * data.noOfSeats;
            
            const bookingPayload = {...data,totalCost};
            const booking = await this.bookingRepository.create(bookingPayload);

            const updateFlightRequestUrl= `${FLIGHT_SERVICE_PATH}/api/v1/flights/${booking.flightId}`;
            await axios.patch(updateFlightRequestUrl,{totalSeats:flightData.totalSeats - booking.noOfSeats});

            const finalBooking= await this.bookingRepository.update(booking.id,{status:'Booked'});
        //     const userId = finalBooking.userId;
        //     let getUserRequestUrl = `${USER_SERVICE_PATH}/api/v1/users/${userId}`;
        //    const user =  await axios.get(getUserRequestUrl);
           const payLoad = {
            data:{
                mailFrom:"airlineHelpline@gamil.com",
                mailTo:"rohitdhankhar7347@gmail.com",
                mailSubject:"Booking confirmation Mail",
                mailBody:`Dear user this is to inform you that your booking is confirmed`
            },
            service:'SEND_BASIC_MAIL'
           };
            publishMessage(channel,REMINDER_BINDING_KEY,JSON.stringify(payLoad));
           const ticketPayload={
            data:{
                subject:"Ticket Reminder Mail",
                content:`Dear user this is to inform you that you have a booking at 20:38:00`,
                recepientEmail:"rohitdhankhar7347@gmail.com",
                notificationTime:new Date('2026-01-22T20:38:00')
            },
            service:'CREATE_TICKET',
           };
            publishMessage(channel,REMINDER_BINDING_KEY,JSON.stringify(ticketPayload));
           
            return finalBooking;
        } catch (error) {
            console.log(error);
            if(error.name =='ValidationError' || error.name =='Repository') throw error;
         throw new ServiceError();  
        }
    
    }
}
module.exports = BookingService;