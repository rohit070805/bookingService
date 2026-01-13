const { StatusCodes } = require('http-status-codes');
const {Booking}= require('../models/index');
const { ValidationError, AppError } = require('../utils/errors');

class BookingRepository{
    async create(data){
        try{
            const booking = await Booking.create(data);
            return booking;
        }
        catch(error){
            if(error.name=="SequelizeValidationError"){
                throw new ValidationError(error);
            }
            throw new AppError(
                    "Repository Error",
                    "Can not create booking",
                    "There qas some issue,try again later",
                    StatusCodes.INTERNAL_SERVER_ERROR
            )
        }

    }

    
}
module.exports = BookingRepository;