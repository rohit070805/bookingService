const { StatusCodes } = require('http-status-codes');
const {BookingService} = require('../services/index');

const bookingService = new BookingService();
class BookingController{
    

    async create (req,res){
    try {
        const channel = req.channel;
        const response = await bookingService.createBooking(req.body,channel);
       
        return res.status(StatusCodes.OK).json({
            message:"Succefully completed a Booking",
            success:true,
            data:response,
            err:{}
        })
    } catch (error) {

       return res.status(error.statusCode).json({
            message:error.message,
            success:false,
            data:{},
            err:error.explanation
        })
    }
}

}

module.exports = BookingController