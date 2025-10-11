import Contact from '../models/contacts.js';

export async function getContacts(req, res) {
  try {
    const contacts = await Contact.find();
    return res.status(200).json(contacts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getContactById(req, res) {
  try {
    const contact = await Contact.findById(req.params.id);
    return res.status(200).json(contact);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function createContact(req, res) {
  try {
    const contact = new Contact({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      title: req.body.title,
      content: req.body.content,
    });
    await contact.save();

    return res.status(200).json(contact);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function deleteContact(req, res) {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    return res.status(200).json('Contact has been deleted');
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function updateContact(req, res) {
  try {
    const id = req.params.id;
    const contact = await Contact.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          status: req.body.status,
        },
      },
      {
        new: true,
      }
    );
    return res.status(200).json(contact);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
