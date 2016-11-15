data <- file("stdin", "r")

row <- readLines(data)

write(row, "")
write("This is supposed to be stdout", "")