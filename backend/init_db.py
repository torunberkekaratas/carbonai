from database import Base, engine
import models  # bu import şart, yoksa tablolar kaydolmaz

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Done.")