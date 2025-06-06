import {
  Button,
  CloseButton,
  Container,
  Field,
  FileUpload,
  Input,
  InputGroup,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { Toaster, toaster } from "@/components/ui/toaster";
import { addStudent, addUser } from "@/services/api";
import { LuFileUp } from "react-icons/lu";

export default function AddStudent() {
  const [id, setId] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState(0);
  const [stClass, setStClass] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [img, setImg] = useState<File>();

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !name || !age || !stClass || !password || !img) {
      toaster.create({
        title: "Please fill all the fields",
        type: "error",
        duration: 3000,
      });
      return;
    }

    const safePattern = /^[a-zA-Z0-9@$!_ ]+$/;
    const idValid = safePattern.test(id.toString());
    const nameValid = safePattern.test(name);
    const ageValid = safePattern.test(age.toString());
    const stClassValid = safePattern.test(stClass);
    const passwordValid = safePattern.test(password);

    if (
      !idValid ||
      !nameValid ||
      !ageValid ||
      !stClassValid ||
      !passwordValid
    ) {
      toaster.create({
        title: "Invalid input",
        description:
          "Only letters, numbers, and the characters @ $ ! _ are allowed.",
        type: "error",
        duration: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `https://enrollstudents.azurewebsites.net/api/enrollStudent?cur_class=${stClass}&student_id=${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": img ? img.type : "application/octet-stream",
          },
          body: img,
        }
      );

      if ((await response.status) === 400) {
        throw new Error(await response.text());
      }

      const data = await response.text();
      console.log(data);

      const newUser = await addUser({
        user_id: id,
        password: password,
        role: "student",
      });

      console.log(newUser);

      const newStudent = await addStudent({
        id: id,
        name: name,
        age: age,
        class: stClass,
      });

      console.log(newStudent);

      toaster.create({
        title: "Student added",
        type: "success",
        duration: 3000,
      });

      setId(0);
      setAge(0);
      setName("");
      setStClass("");
      setPassword("");
    } catch (error) {
      setId(0);
      setAge(0);
      setName("");
      setStClass("");
      setPassword("");
      toaster.create({
        title: "Error adding student",
        description:
          error instanceof Error ? error.message : "Failed to add student",
        type: "error",
        duration: 6000,
      });
      console.log(
        error instanceof Error ? error.message : "Failed to add student"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container
        maxW="md"
        bg="white"
        p={8}
        borderRadius="md"
        boxShadow="lg"
        mt={12}
      >
        <Toaster />
        <VStack mt={8}>
          <Spinner size="lg" color="blue.500" />
          <Text fontSize="lg" fontWeight="medium">
            Adding Student...
          </Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container bg="white" p={8} borderRadius="md" boxShadow="lg" mt={12}>
      <Toaster />
      <VStack align="stretch">
        <Field.Root>
          <Field.Root>
            <Field.Label
              fontSize="1.1rem"
              fontWeight={600}
              mb={1}
              color="gray.700"
            >
              Id
            </Field.Label>
            <Input
              name="Id"
              type="number"
              value={id}
              onChange={(e) => setId(parseInt(e.target.value))}
              placeholder="Enter student ID"
              bg="gray.50"
              _placeholder={{ color: "gray.400" }}
            />
          </Field.Root>

          <Field.Root marginTop={"1%"}>
            <Field.Label
              fontSize="1.1rem"
              fontWeight={600}
              mb={1}
              color="gray.700"
            >
              Name
            </Field.Label>
            <Input
              name="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              bg="gray.50"
              _placeholder={{ color: "gray.400" }}
            />
          </Field.Root>

          <Field.Root marginTop={"1%"}>
            <Field.Label
              fontSize="1.1rem"
              fontWeight={600}
              mb={1}
              color="gray.700"
            >
              Age
            </Field.Label>
            <Input
              name="Age"
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              placeholder="Age"
              bg="gray.50"
              _placeholder={{ color: "gray.400" }}
            />
          </Field.Root>

          <Field.Root marginTop={"1%"}>
            <Field.Label
              fontSize="1.1rem"
              fontWeight={600}
              mb={1}
              color="gray.700"
            >
              Class
            </Field.Label>
            <Input
              name="Class"
              type="text"
              value={stClass}
              onChange={(e) => setStClass(e.target.value)}
              placeholder="e.g., I4"
              bg="gray.50"
              _placeholder={{ color: "gray.400" }}
            />
          </Field.Root>

          <Field.Root marginTop={"1%"}>
            <Field.Label
              fontSize="1.1rem"
              fontWeight={600}
              mb={1}
              color="gray.700"
            >
              Password
            </Field.Label>
            <Input
              name="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a secure password"
              bg="gray.50"
              _placeholder={{ color: "gray.400" }}
            />
          </Field.Root>

          <FileUpload.Root
            marginTop={"1%"}
            gap="1"
            accept={["image/png", "image/jpeg", "image/jpg"]}
            onFileChange={(e) => {
              setImg(e.acceptedFiles[0]);
            }}
          >
            <FileUpload.HiddenInput />
            <FileUpload.Label fontSize={"1rem"} fontWeight={600}>
              Upload file
            </FileUpload.Label>
            <InputGroup
              startElement={<LuFileUp />}
              endElement={
                <FileUpload.ClearTrigger asChild>
                  <CloseButton
                    me="-1"
                    size="xs"
                    variant="plain"
                    focusVisibleRing="inside"
                    focusRingWidth="2px"
                    pointerEvents="auto"
                  />
                </FileUpload.ClearTrigger>
              }
            >
              <Input asChild bg="gray.50">
                <FileUpload.Trigger>
                  <FileUpload.FileText lineClamp={1} />
                </FileUpload.Trigger>
              </Input>
            </InputGroup>
          </FileUpload.Root>

          <Field.Root marginTop={"1%"} required>
            <Button
              type="submit"
              backgroundColor="blue.500"
              color="white"
              fontWeight={700}
              _hover={{ backgroundColor: "blue.600" }}
              w="50%"
              py={4}
              mt={4}
              onClick={handleAddStudent}
              alignSelf={"center"}
            >
              Add Student
            </Button>
          </Field.Root>
        </Field.Root>
      </VStack>
    </Container>
  );
}
