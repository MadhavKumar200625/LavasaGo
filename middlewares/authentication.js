export default (req, res, next) => {
    const token = process.env.KEY
  
    if (!token) {
      return res.sendStatus(401) 
    }
  
    
    if (req.headers.authorization !== `Bearer ${token}`) {
      return res.sendStatus(403) 
    }
  
    next() 
  }

