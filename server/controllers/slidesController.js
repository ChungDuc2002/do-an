import Slide from '../models/slides.js';

//* LOGIC GET ALL SLIDES
export async function getSlides(req, res) {
  try {
    const slides = await Slide.find();
    return res.status(200).json(slides);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

//* LOGIC GET SLIDE BY ID
export async function getSlideById(req, res) {
  try {
    const slide = await Slide.findById(req.params.id);
    return res.status(200).json(slide);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

//* LOGIC CREATE SLIDE
export async function uploadSlide(req, res) {
  const imageName = req.file.filename;
  try {
    const slide = new Slide({
      image: imageName,
      title: req.body.title,
      description: req.body.description,
    });
    await slide.save();

    return res.status(201).json(slide);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

//* LOGIC DELETE SLIDE
export async function deleteSlide(req, res) {
  try {
    await Slide.findByIdAndDelete(req.params.id);
    return res.status(200).json('Slide has been deleted');
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

//* LOGIC UPDATE SLIDE

export async function updateSlide(req, res) {
  // try {
  //   const id = req.params.id;
  //   const result = await Slide.findByIdAndUpdate(
  //     id,
  //     {
  //       //* đặt các trường và giá trị mới cho bản ghi người dùng dựa trên req.body
  //       $set: req.body,
  //     },
  //     //* trả về bản ghi mới sau khi cập nhật
  //     { new: true }
  //   );
  //   return res.status(200).json(result);
  // } catch (error) {
  //   return res.status(500).json({ message: error.message });
  // }
  const imageName = req.file.filename;
  try {
    const id = req.params.id;
    const result = await Slide.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        image: imageName,
        title: req.body.title,
        description: req.body.description,
      }
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
