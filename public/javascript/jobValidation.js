const Joi = require('joi');
const validateJobDetails = (jobDetails) => {
    const JoiSchema = Joi.object({
                jobTitle: Joi.string()
                        .required(),
                salaryRange: Joi.string()
                        .required(),
                requiredSkills: Joi.string()
                        .required(),
                moreDetails: Joi.string()
                        .required(),
            });
            return JoiSchema.validate(jobDetails);
}

module.exports = { validateJobDetails };