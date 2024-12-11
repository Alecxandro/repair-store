import Repair from '../models/Repair.js'
import Customer from '../models/Customer.js'

export const createRepair = async (req, res) => {
  try {
    const { deviceType, brand, model, problemDescription, estimatedCost, repairNotes, completionDate, customerId } = req.body

    const customer = await Customer.findOne({
      _id: customerId,
      user: req.user.id,
    })
    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found or does not belong to the current user',
      })
    }

    // Create a new repair document
    const newRepair = await Repair.create({
      customer: customer._id,
      deviceType,
      brand,
      model,
      problemDescription,
      estimatedCost,
      repairNotes,
      completionDate,
    })

    res.status(201).json(newRepair)
  } catch (error) {
    console.error('Error creating repair:', error)
    res.status(500).json({
      message: 'Failed to create repair',
      details: error.message,
    })
  }
}

export const getRepairs = async (req, res) => {
  try {
    const customers = await Customer.find({
      user: req.user.id,
    }).select('_id')
    const customerIds = customers.map((customer) => customer._id)

    // Fetch repairs for those customers
    const repairs = await Repair.find({
      customer: {
        $in: customerIds,
      },
    }).populate('customer', 'name email')

    if (repairs.length === 0) {
      return res.status(404).json({
        message: 'No repairs found for the user',
      })
    }

    return res.status(200).json(repairs)
  } catch (error) {
    console.error('Error fetching repairs:', error)
    return res.status(500).json({
      message: 'Failed to retrieve repairs',
      details: error.message,
    })
  }
}

export const getRepair = async (req, res) => {
  try {
    const repair = await Repair.findById(req.params.id).populate('customer', 'name email')
    if (!repair) {
      return res.status(404).json({
        message: 'Repair not found',
      })
    }
    return res.status(200).json(repair)
  } catch (error) {
    console.error('Error fetching repair:', error)
    return res.status(500).json({
      message: 'Failed to retrieve repair',
    })
  }
}

export const updateRepairStatus = async (req, res) => {
  try {
    const { repairId } = req.params
    const { status } = req.body

    const allowedStatuses = ['pending', 'in-progress', 'completed', 'cancelled']
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Allowed statuses are: ' + allowedStatuses.join(', '),
      })
    }

    const updatedRepair = await Repair.findOneAndUpdate(
      {
        _id: repairId,
        customer: {
          $in: await Customer.find({
            user: req.user.id,
          }).distinct('_id'),
        },
      },
      {
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    )

    if (!updatedRepair) {
      return res.status(404).json({
        message: "Repair not found or you don't have permission to update this repair",
      })
    }

    res.status(200).json(updatedRepair)
  } catch (error) {
    console.error('Error updating repair status:', error)
    res.status(500).json({
      message: 'Failed to update repair status',
      details: error.message,
    })
  }
}
