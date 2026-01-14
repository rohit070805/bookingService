const { default: axios } = require('axios');
const {BookingRepository} = require('../repository/index');
const {FLIGHT_SERVICE_PATH} =require('../config/serverConfig');
const { ServiceError } = require('../utils/errors');
class BookingService{
    constructor(){
        this.bookingRepository= new BookingRepository();
    }
    async createBooking(data){
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
            return finalBooking;
        } catch (error) {
            console.log(error);
            if(error.name =='ValidationError' || error.name =='Repository') throw error;
         throw new ServiceError();  
        }
    
    }
}
module.exports = BookingService;